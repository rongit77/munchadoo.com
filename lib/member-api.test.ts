import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateKeyPair, SignJWT } from "jose";
import { NextRequest } from "next/server";
import { POST } from "../app/api/member/route";
import { database } from "./member-store";
const keyState = vi.hoisted(() => ({ key: undefined as unknown }));
vi.mock("jose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jose")>();
  return { ...actual, createRemoteJWKSet: () => async () => keyState.key };
});
let temp: string;
beforeAll(() => {
  temp = mkdtempSync(join(tmpdir(), "munch-api-"));
  process.env.MUNCH_DATABASE_PATH = join(temp, "test.sqlite");
  process.env.APP_ORIGIN = "https://munchadoo.com";
});
afterAll(() => {
  database().close();
  rmSync(temp, { recursive: true, force: true });
  delete process.env.MUNCH_DATABASE_PATH;
  delete process.env.APP_ORIGIN;
  vi.unstubAllEnvs();
});
function post(body: unknown, cookie = "", origin = "https://munchadoo.com") {
  return POST(
    new NextRequest("https://munchadoo.com/api/member", {
      method: "POST",
      headers: { origin, "content-type": "application/json", cookie },
      body: JSON.stringify(body),
    }),
  );
}
describe("member HTTP boundary", () => {
  it("blocks cross-origin and anonymous mutations", async () => {
    expect(
      (await post({ action: "guest" }, "", "https://evil.example")).status,
    ).toBe(403);
    expect((await post({ action: "start", game: "slots" })).status).toBe(401);
  });
  it("keeps favorites private and deletes the profile with its session", async () => {
    const g = await post({ action: "guest" });
    const cookie = g.headers.get("set-cookie")!.split(";")[0];
    expect(g.headers.get("set-cookie")).toContain("HttpOnly");
    const before = await g.json();
    const saved = await post(
      { action: "favorite", placeId: "ChIJtest", label: "My pizza" },
      cookie,
    );
    expect((await saved.json()).profile.favorites).toHaveLength(1);
    const other = await post({ action: "guest" });
    expect((await other.json()).profile.favorites).toHaveLength(0);
    expect((await post({ action: "name", name: "" }, cookie)).status).toBe(400);
    await post({ action: "delete" }, cookie);
    expect(
      database()
        .prepare("SELECT id FROM users WHERE id=?")
        .get(before.profile.user.id),
    ).toBeUndefined();
    expect((await post({ action: "name", name: "hi" }, cookie)).status).toBe(
      401,
    );
  });
  it("rejects unconfigured Google and malformed credentials", async () => {
    const g = await post({ action: "guest" });
    const cookie = g.headers.get("set-cookie")!.split(";")[0];
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    expect((await post({ action: "google-prepare" }, cookie)).status).toBe(503);
    vi.stubEnv("GOOGLE_CLIENT_ID", "test.apps.googleusercontent.com");
    const nonce = await post({ action: "google-prepare" }, cookie);
    expect((await nonce.json()).nonce).toHaveLength(48);
    expect(
      (
        await post(
          { action: "google", credential: "not-a-signed-token" },
          cookie,
        )
      ).status,
    ).toBe(400);
  });
});

describe("Google token verification and account linking", () => {
  async function prepared() {
    vi.stubEnv("GOOGLE_CLIENT_ID", "club-test.apps.googleusercontent.com");
    const g = await post({ action: "guest" });
    const cookie = g.headers.get("set-cookie")!.split(";")[0];
    const initial = await g.json();
    const n = await post({ action: "google-prepare" }, cookie);
    return { cookie, initial, nonce: (await n.json()).nonce };
  }
  async function credential(
    nonce: string,
    audience = "club-test.apps.googleusercontent.com",
    expiration = "5m",
  ) {
    const pair = await generateKeyPair("RS256");
    keyState.key = pair.publicKey;
    return new SignJWT({ nonce, name: "Test Member" })
      .setProtectedHeader({ alg: "RS256", kid: "test" })
      .setIssuer("https://accounts.google.com")
      .setAudience(audience)
      .setSubject("verified-google-subject")
      .setIssuedAt()
      .setExpirationTime(expiration)
      .sign(pair.privateKey);
  }
  it("upgrades the guest, rotates session and rejects replay", async () => {
    const p = await prepared();
    await post(
      { action: "favorite", placeId: "ChIJtest", label: "Our spot" },
      p.cookie,
    );
    const token = await credential(p.nonce);
    const res = await post({ action: "google", credential: token }, p.cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.profile.user.id).toBe(p.initial.profile.user.id);
    expect(data.profile.user.registered).toBe(1);
    expect(data.profile.favorites).toHaveLength(1);
    expect(res.headers.get("set-cookie")!.split(";")[0]).not.toBe(p.cookie);
    expect(
      (await post({ action: "google", credential: token }, p.cookie)).status,
    ).toBe(401);
  });
  it("loads an existing Google account without multiplying credits", async () => {
    const p = await prepared();
    const existing = database()
      .prepare("SELECT id FROM users WHERE google_sub=?")
      .get("verified-google-subject")!;
    const res = await post(
      { action: "google", credential: await credential(p.nonce) },
      p.cookie,
    );
    expect(res.status).toBe(200);
    expect((await res.json()).profile.user.id).toBe(existing.id);
  });
  it("rejects wrong audience, expired tokens and mismatched nonce", async () => {
    const p = await prepared();
    for (const makeToken of [
      () => credential(p.nonce, "wrong"),
      () => credential(p.nonce, undefined, "-5m"),
      () => credential("wrong-nonce"),
    ]) {
      const token = await makeToken();
      expect(
        (await post({ action: "google", credential: token }, p.cookie)).status,
      ).toBeGreaterThanOrEqual(400);
    }
    expect(
      database()
        .prepare("SELECT google_sub FROM users WHERE id=?")
        .get(p.initial.profile.user.id)?.google_sub,
    ).toBeNull();
  });
});
