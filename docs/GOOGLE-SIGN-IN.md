# Google sign-in setup

Create/use a Google OAuth Client ID of type **Web application**. Configure Google Auth Platform branding, audience/test users and published status as appropriate. The existing Maps key is unrelated.

Authorized JavaScript origins:
- `https://munchadoo.com`
- `http://localhost:3000`
- `http://127.0.0.1:3000` if accepted by the Google console; otherwise use localhost for sign-in testing.

This implementation uses the GIS JavaScript callback ID-token flow, not an OAuth redirect/code exchange. It does not need a client secret or redirect URI. Set `GOOGLE_CLIENT_ID` in `.env.local` and cPanel application environment. Restart after changing configuration. Set `APP_ORIGIN` to the exact production origin; for localhost development omit it or set to the exact local origin.

Before publish:
1. Install the changed pinned dependencies on Namecheap (publish refuses a mismatched lockfile).
2. Verify Node 24 supports `node:sqlite` on that host.
3. Set `MUNCH_DATABASE_PATH` to a private persistent path, e.g. `/home/muncicsh/munchadoo-data/club.sqlite`. Ensure parent and DB are private. Configure database backups separately from code-release rollback (SQLite online backup or consistent snapshot; do not copy only the DB while WAL writes are active).
4. Verify actual Google sign-in, new guest upgrade, existing-account login, reload, logout and delete on HTTPS. Client ID is now configured. Real-account verification remains pending.
5. Verify no web path exposes the DB; the release archives never contain data. No Google token or precise location should be logged.

Current limits: one host, per-process request throttle, profile-based earning caps; no valuable prizes, no automated cross-device account merging, no scheduled guest-data cleanup yet. Account data stays until profile deletion. Durable storage deployed on 2026-11-15 at the private path above; account retention is until profile deletion. Scheduled database backup/restore procedures remain an operational follow-up.
