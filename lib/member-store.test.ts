import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll } from "vitest";
import {
  database,
  guest,
  profile,
  session,
  startRound,
  guessNumber,
  transaction,
} from "./member-store";
let temp: string;
beforeAll(() => {
  temp = mkdtempSync(join(tmpdir(), "munch-member-"));
  process.env.MUNCH_DATABASE_PATH = join(temp, "test.sqlite");
});
beforeEach(() => {
  vi.useRealTimers();
  database().exec(
    "DELETE FROM users; DELETE FROM sessions; DELETE FROM rounds; DELETE FROM ledger; DELETE FROM favorites;",
  );
});
afterAll(() => {
  database().close();
  rmSync(temp, { recursive: true, force: true });
  delete process.env.MUNCH_DATABASE_PATH;
});
describe("server-owned club state", () => {
  it("issues unpredictable sessions without persisting raw tokens", () => {
    const g = guest();
    expect(session(g.token)?.user_id).toBe(g.id);
    expect(session("fake")).toBeUndefined();
    expect(
      database().prepare("SELECT token FROM sessions").get()?.token,
    ).not.toBe(g.token);
  });
  it("expires sessions", () => {
    const g = guest();
    database().prepare("UPDATE sessions SET expires=0").run();
    expect(session(g.token)).toBeUndefined();
  });
  it("does not disclose the secret, enforces ownership and awards once", () => {
    const g = guest(),
      other = guest();
    const round = startRound(g.id, "number");
    expect(round).not.toHaveProperty("secret");
    const secret = Number(
      database()
        .prepare("SELECT secret FROM rounds WHERE id=?")
        .get(round.round)?.secret,
    );
    expect(() => guessNumber(other.id, round.round, secret)).toThrow();
    expect(guessNumber(g.id, round.round, secret).earned).toBe(10);
    expect(() => guessNumber(g.id, round.round, secret)).toThrow();
    expect(profile(g.id).balance).toBe(10);
    expect(profile(other.id).balance).toBe(0);
  });
  it("enforces ten guesses without rewarding a loss", () => {
    const g = guest(),
      round = startRound(g.id, "number");
    const secret = Number(
      database()
        .prepare("SELECT secret FROM rounds WHERE id=?")
        .get(round.round)?.secret,
    );
    for (let i = 0; i < 10; i++) {
      const result = guessNumber(g.id, round.round, secret === 1 ? 2 : 1);
      expect(result.done).toBe(i === 9);
    }
    expect(profile(g.id).balance).toBe(0);
    expect(() => guessNumber(g.id, round.round, secret)).toThrow();
  });
  it("caps daily credits but allows free play", () => {
    vi.useFakeTimers();
    const g = guest();
    for (let i = 0; i < 13; i++) {
      vi.advanceTimersByTime(4000);
      const result = startRound(g.id, i % 2 ? "slots" : "wheel");
      expect(result.result?.every((n) => n >= 0 && n < 6)).toBe(true);
      expect(result.earned).toBe(i < 10 ? 10 : 0);
    }
    expect(profile(g.id).balance).toBe(100);
    vi.useRealTimers();
  });
  it("rolls back failed transactions", () => {
    expect(() =>
      transaction(() => {
        guest();
        throw new Error("rollback");
      }),
    ).toThrow();
    expect(database().prepare("SELECT COUNT(*) AS n FROM users").get()?.n).toBe(
      0,
    );
  });
  it("rejects rapid rounds and invalidates old ones", () => {
    const g = guest();
    const first = startRound(g.id, "number");
    expect(() => startRound(g.id, "slots")).toThrow("slow-down");
    database().prepare("UPDATE rounds SET created=created-4000").run();
    startRound(g.id, "number");
    expect(() => guessNumber(g.id, first.round, 10)).toThrow("round-ended");
  });
});
