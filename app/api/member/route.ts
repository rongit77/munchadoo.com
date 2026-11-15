import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  database,
  guest,
  hash,
  issueSession,
  profile,
  session,
  startRound,
  guessNumber,
  transaction,
} from "@/lib/member-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const keys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
const cookie = "munch_session";
const limits = new Map<string, { count: number; until: number }>();
function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
function attach(response: NextResponse, token: string) {
  response.cookies.set(cookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
  return response;
}
export async function GET(req: NextRequest) {
  try {
    const s = session(req.cookies.get(cookie)?.value || "");
    return json({
      profile: s ? profile(s.user_id) : null,
      googleEnabled: !!process.env.GOOGLE_CLIENT_ID,
    });
  } catch {
    return json({ error: "unavailable" }, 503);
  }
}
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowed =
    process.env.APP_ORIGIN ||
    (process.env.NODE_ENV === "production"
      ? "https://munchadoo.com"
      : new URL(req.url).origin);
  const devOrigin =
    process.env.NODE_ENV !== "production" &&
    ["http://localhost:3000", "http://127.0.0.1:3000"].includes(origin || "");
  if (origin !== allowed && !devOrigin) return json({ error: "origin" }, 403);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "shared";
  const now = Date.now();
  for (const [key, value] of limits) if (value.until < now) limits.delete(key);
  const limit = limits.get(ip) || { count: 0, until: now + 60000 };
  if (++limit.count > 90) return json({ error: "slow-down" }, 429);
  limits.set(ip, limit);
  try {
    if (Number(req.headers.get("content-length") || 0) > 20000)
      return json({ error: "invalid" }, 400);
    const raw = await req.text();
    if (raw.length > 20000) return json({ error: "invalid" }, 400);
    const body = JSON.parse(raw);
    const token = req.cookies.get(cookie)?.value || "";
    const current = session(token);
    if (body.action === "guest") {
      if (current) return json({ profile: profile(current.user_id) });
      const g = guest();
      return attach(json({ profile: profile(g.id) }), g.token);
    }
    if (!current) return json({ error: "session" }, 401);
    const id = current.user_id,
      d = database();
    if (body.action === "google-prepare") {
      if (!process.env.GOOGLE_CLIENT_ID)
        return json({ error: "google-not-configured" }, 503);
      const nonce = randomBytes(24).toString("hex");
      d.prepare("UPDATE sessions SET nonce=? WHERE token=?").run(
        nonce,
        hash(token),
      );
      return json({ clientId: process.env.GOOGLE_CLIENT_ID, nonce });
    }
    if (body.action === "google") {
      if (
        !process.env.GOOGLE_CLIENT_ID ||
        typeof body.credential !== "string" ||
        !current.nonce
      )
        return json({ error: "invalid" }, 400);
      const { payload } = await jwtVerify(body.credential, keys, {
        issuer: ["https://accounts.google.com", "accounts.google.com"],
        audience: process.env.GOOGLE_CLIENT_ID,
        algorithms: ["RS256"],
      });
      if (
        !payload.sub ||
        payload.nonce !== current.nonce ||
        !payload.exp ||
        !payload.iat ||
        payload.iat > now / 1000 + 60
      )
        return json({ error: "google-invalid" }, 401);
      const target = transaction(() => {
        const changed = d
          .prepare("UPDATE sessions SET nonce=NULL WHERE token=? AND nonce=?")
          .run(hash(token), current.nonce);
        if (!changed.changes) throw new Error("invalid");
        const existing = d
          .prepare("SELECT id FROM users WHERE google_sub=?")
          .get(payload.sub!) as { id: string } | undefined;
        const registered = d
          .prepare("SELECT google_sub FROM users WHERE id=?")
          .get(id)?.google_sub;
        if (registered && registered !== payload.sub)
          throw new Error("logout-first");
        if (existing) return existing.id;
        d.prepare("UPDATE users SET google_sub=?,name=? WHERE id=?").run(
          payload.sub!,
          typeof payload.name === "string"
            ? payload.name.slice(0, 60)
            : "Munchie",
          id,
        );
        return id;
      });
      d.prepare("DELETE FROM sessions WHERE token=?").run(hash(token));
      return attach(json({ profile: profile(target) }), issueSession(target));
    }
    if (body.action === "logout" || body.action === "delete") {
      transaction(() => {
        if (body.action === "delete") {
          for (const table of ["sessions", "ledger", "favorites", "rounds"])
            d.prepare(`DELETE FROM ${table} WHERE user_id=?`).run(id);
          d.prepare("DELETE FROM users WHERE id=?").run(id);
        } else d.prepare("DELETE FROM sessions WHERE token=?").run(hash(token));
      });
      return attach(json({ profile: null }), "");
    }
    if (body.action === "name") {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.length > 40
      )
        return json({ error: "invalid" }, 400);
      d.prepare("UPDATE users SET name=? WHERE id=?").run(body.name.trim(), id);
    } else if (body.action === "favorite") {
      if (
        typeof body.placeId !== "string" ||
        !/^[A-Za-z0-9_-]{1,200}$/.test(body.placeId) ||
        typeof body.label !== "string" ||
        body.label.length > 60
      )
        return json({ error: "invalid" }, 400);
      if (body.remove)
        d.prepare("DELETE FROM favorites WHERE user_id=? AND place_id=?").run(
          id,
          body.placeId,
        );
      else {
        if (
          Number(
            d
              .prepare("SELECT COUNT(*) AS n FROM favorites WHERE user_id=?")
              .get(id)?.n,
          ) >= 100
        )
          return json({ error: "favorite-limit" }, 400);
        d.prepare("INSERT OR REPLACE INTO favorites VALUES(?,?,?)").run(
          id,
          body.placeId,
          body.label.trim() || "My spot",
        );
      }
    } else if (body.action === "start") {
      if (!["number", "wheel", "slots"].includes(body.game))
        return json({ error: "invalid" }, 400);
      return json({ ...startRound(id, body.game), profile: profile(id) });
    } else if (body.action === "guess") {
      if (
        !Number.isInteger(body.guess) ||
        body.guess < 1 ||
        body.guess > 100 ||
        typeof body.round !== "string"
      )
        return json({ error: "invalid" }, 400);
      return json({
        ...guessNumber(id, body.round, body.guess),
        profile: profile(id),
      });
    } else return json({ error: "invalid" }, 400);
    return json({ profile: profile(id) });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    return json(
      {
        error: ["slow-down", "round-ended", "logout-first"].includes(code)
          ? code
          : "request-failed",
      },
      400,
    );
  }
}
