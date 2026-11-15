import { DatabaseSync } from "node:sqlite";
import { randomBytes, randomInt, randomUUID, createHash } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

let db: DatabaseSync;
export function database() {
  if (!db) {
    const path =
      process.env.MUNCH_DATABASE_PATH || resolve("data/munchadoo.sqlite");
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    db = new DatabaseSync(path);
    chmodSync(path, 0o600);
    db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, google_sub TEXT UNIQUE, name TEXT NOT NULL, created INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL, nonce TEXT);
      CREATE TABLE IF NOT EXISTS ledger(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, game TEXT NOT NULL, amount INTEGER NOT NULL, created INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS favorites(user_id TEXT NOT NULL, place_id TEXT NOT NULL, label TEXT NOT NULL, PRIMARY KEY(user_id,place_id));
      CREATE TABLE IF NOT EXISTS rounds(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, game TEXT NOT NULL, secret INTEGER, attempts INTEGER NOT NULL DEFAULT 0, done INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL);
    `);
  }
  return db;
}
export function transaction<T>(fn: () => T): T {
  const d = database();
  d.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    d.exec("COMMIT");
    return result;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function session(token: string) {
  return database()
    .prepare("SELECT user_id,nonce FROM sessions WHERE token=? AND expires>?")
    .get(hash(token), Date.now()) as
    { user_id: string; nonce: string | null } | undefined;
}
export function issueSession(id: string) {
  const token = randomBytes(32).toString("hex");
  database()
    .prepare("INSERT INTO sessions VALUES(?,?,?,NULL)")
    .run(hash(token), id, Date.now() + 30 * 86400000);
  return token;
}
export function guest() {
  const id = randomUUID();
  database()
    .prepare("INSERT INTO users VALUES(?,NULL,?,?)")
    .run(id, "Munchie", Date.now());
  return { id, token: issueSession(id) };
}
export function profile(id: string) {
  const d = database();
  const user = d
    .prepare(
      "SELECT id,name,google_sub IS NOT NULL AS registered FROM users WHERE id=?",
    )
    .get(id);
  const balance = d
    .prepare(
      "SELECT COALESCE(SUM(amount),0) AS value FROM ledger WHERE user_id=?",
    )
    .get(id)?.value;
  const history = d
    .prepare(
      "SELECT id,game,amount,created FROM ledger WHERE user_id=? ORDER BY created DESC LIMIT 20",
    )
    .all(id);
  const stats = d
    .prepare(
      "SELECT game,COUNT(*) AS count FROM ledger WHERE user_id=? GROUP BY game",
    )
    .all(id);
  const favorites = d
    .prepare("SELECT place_id AS id,label FROM favorites WHERE user_id=?")
    .all(id);
  return { user, balance, history, stats, favorites };
}
export type ArcadeGame = "number" | "wheel" | "slots";
export function startRound(id: string, game: ArcadeGame) {
  return transaction(() => {
    const d = database();
    const recent = d
      .prepare(
        "SELECT created FROM rounds WHERE user_id=? ORDER BY created DESC LIMIT 1",
      )
      .get(id) as { created: number } | undefined;
    if (recent && Date.now() - recent.created < 3000)
      throw new Error("slow-down");
    d.prepare("DELETE FROM rounds WHERE created<?").run(Date.now() - 86400000);
    d.prepare("UPDATE rounds SET done=1 WHERE user_id=? AND done=0").run(id);
    const round = randomUUID();
    d.prepare(
      "INSERT INTO rounds(id,user_id,game,secret,created) VALUES(?,?,?,?,?)",
    ).run(
      round,
      id,
      game,
      game === "number" ? randomInt(1, 101) : null,
      Date.now(),
    );
    if (game === "number") return { round, done: false };
    const result =
      game === "wheel"
        ? [randomInt(6)]
        : [randomInt(6), randomInt(6), randomInt(6)];
    return {
      round,
      done: true,
      result,
      earned: completeRound(id, round, game),
    };
  });
}
function completeRound(id: string, round: string, game: string) {
  const d = database();
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const earned = Number(
    d
      .prepare(
        "SELECT COALESCE(SUM(amount),0) AS value FROM ledger WHERE user_id=? AND created>=?",
      )
      .get(id, day.getTime())?.value,
  );
  const amount = Math.max(0, Math.min(10, 100 - earned));
  d.prepare("UPDATE rounds SET done=1 WHERE id=? AND user_id=?").run(round, id);
  d.prepare("INSERT INTO ledger VALUES(?,?,?,?,?)").run(
    round,
    id,
    game,
    amount,
    Date.now(),
  );
  return amount;
}
export function guessNumber(id: string, round: string, guess: number) {
  return transaction(() => {
    const d = database();
    const row = d
      .prepare("SELECT * FROM rounds WHERE id=? AND user_id=?")
      .get(round, id) as
      | {
          game: string;
          done: number;
          secret: number;
          attempts: number;
          created: number;
        }
      | undefined;
    if (
      !row ||
      row.game !== "number" ||
      row.done ||
      Date.now() - row.created > 1800000
    )
      throw new Error("round-ended");
    const attempts = row.attempts + 1;
    d.prepare("UPDATE rounds SET attempts=? WHERE id=?").run(attempts, round);
    if (guess === row.secret)
      return {
        done: true,
        hint: "correct",
        attempts,
        earned: completeRound(id, round, "number"),
      };
    if (attempts >= 10) {
      d.prepare("UPDATE rounds SET done=1 WHERE id=?").run(round);
      return {
        done: true,
        hint: "over",
        answer: row.secret,
        attempts,
        earned: 0,
      };
    }
    return {
      done: false,
      hint: guess < row.secret ? "higher" : "lower",
      attempts,
    };
  });
}
