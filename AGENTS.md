# Codex instructions for Munchadoo

## Start here

Read README.md, docs/MVP.md, docs/DECISIONS.md and docs/BACKLOG.md. This repository contains a runnable Next.js local pilot with Google Places, fixture tests, PWA installation and original shared-device games. Do not claim setup, tests, integrations or deployments exist until verified.

## Product requirements

Build a playful restaurant decision experience for families, couples, friends and coworkers. Support location and radius, credible open-now results, fair random selection, verified external ordering links and short shared-device games. Design for global expansion, with a verified pilot market first. Hebrew and English, RTL/LTR, keyboard access and reduced motion belong in the first implementation.

## Working rules

- Use the current user task as scope. Work in small reviewable changes and preserve unrelated work.
- Treat proposed architecture as a default to evaluate, not a historical user approval. Record material changes in docs/DECISIONS.md.
- Keep provider adapters separate from filtering, selection and game logic. Use explicit, labeled fixtures until live provider access is authorized and verified.
- Do not scrape Wolt, Ten Bis or other providers, invent APIs or imply a partnership. Integration requires authorized access and verified terms.
- Never treat unknown opening hours as open. Respect venue timezones and revalidate a winner before presenting live availability.
- Do not commit secrets, precise user coordinates, customer data or provider datasets with unverified storage rights.
- No unrequested subscriptions, paid infrastructure, public deployment, DNS changes or open-source license selection.
- Check official documentation before choosing current dependency versions. Pin dependencies and commit the lockfile when scaffolding.
- Keep code identifiers in English; explain progress to this user in Hebrew unless asked otherwise.

## Privacy and accessibility

- Optional measurement must remain behind valid opt-in, with revocation and deletion. Do not add third-party scripts, fonts, cookies or tracking without updating consent and privacy disclosures.
- Keep policies consistent with actual data flows. Clickabily / info@clickabily.com were provided by the user; no other operator identifiers are verified.
- Preserve keyboard access, visible focus, contrast, text scaling and reduced motion. Never claim legal immunity or full accessibility certification without evidence.
- Read docs/PRIVACY-ACCESSIBILITY-REVIEW.md before public-launch work.

## Verification and handoff

For the app scaffold, add real install/dev/lint/typecheck/test/build commands to README.md and CI. Test meaningful behaviors: radius edges, deduplication, open/closed/unknown, timezone boundaries, empty results, previous winner exclusion, provider failures, permission denial and RTL flows. Do not invent passing test results or add hollow tests for prose changes.

Update backlog status only with evidence. Report changed behavior, checks run, outstanding blockers and next step. Product decisions made in ChatGPT must be captured in the repository; project sources are snapshots and do not sync automatically.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Namecheap publishing

For an explicit publish/deploy request, use `scripts/publish.sh` with Node 24 from this configured workstation. Do not ask the user to upload ZIP files. SSH credentials and pinned known_hosts are outside the repo in the workspace's work/deploy-access directory; never print or commit the private key. The script refuses changed dependency lockfiles until the server dependencies are installed and verified separately. It backs up runtime files, restarts Passenger, verifies HTTPS and a new build asset, and restores on health-check failure. Report the verified release identifier. No automatic publication on ordinary edits.
