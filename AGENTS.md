# Codex instructions for Munchadoo

## Start here

Read README.md, docs/MVP.md, docs/DECISIONS.md and docs/BACKLOG.md. This repository currently contains planning documents, not a runnable application. Do not claim setup, tests, integrations or deployments exist until verified.

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

## Verification and handoff

For the app scaffold, add real install/dev/lint/typecheck/test/build commands to README.md and CI. Test meaningful behaviors: radius edges, deduplication, open/closed/unknown, timezone boundaries, empty results, previous winner exclusion, provider failures, permission denial and RTL flows. Do not invent passing test results or add hollow tests for prose changes.

Update backlog status only with evidence. Report changed behavior, checks run, outstanding blockers and next step. Product decisions made in ChatGPT must be captured in the repository; project sources are snapshots and do not sync automatically.
