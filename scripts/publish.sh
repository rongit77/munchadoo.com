#!/usr/bin/env bash
# Publish from the configured Codex workstation. Credentials stay outside this repo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKSPACE="$(cd "$ROOT/../.." && pwd)"
ACCESS="$WORKSPACE/work/deploy-access"
BUILD="$(mktemp -d "$WORKSPACE/work/publish.XXXXXX")"
SSH=(ssh -i "$ACCESS/munchadoo_ed25519" -p 21098 -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$ACCESS/known_hosts" muncicsh@162.213.255.108)
trap 'rm -rf "$BUILD"' EXIT
cd "$ROOT"
# A dependency change requires a separate reviewed install in the cPanel environment.
LOCAL_LOCK="$(shasum -a 256 package-lock.json | awk '{print $1}')"
REMOTE_LOCK="$("${SSH[@]}" 'sha256sum ~/munchadoo/package-lock.json' | awk '{print $1}')"
if [[ "$LOCAL_LOCK" != "$REMOTE_LOCK" ]]; then
  echo 'Dependency lockfile changed. Install and verify server dependencies before publishing.' >&2
  exit 1
fi
npm run lint
npm run typecheck
npm test
rsync -a --exclude=node_modules --exclude=.next --exclude=.git --exclude='.env*' --exclude='*.tsbuildinfo' "$ROOT/" "$BUILD/"
ln -s "$ROOT/node_modules" "$BUILD/node_modules"
(cd "$BUILD" && NEXT_TELEMETRY_DISABLED=1 npm run build -- --webpack)
RELEASE="$(date -u +%Y%m%dT%H%M%SZ)-$$"
# Only runtime files; never send credentials, environment files or local dependencies.
COPYFILE_DISABLE=1 tar -czf "$BUILD/release.tgz" -C "$BUILD" --exclude='.next/cache' --exclude='.next/diagnostics' --exclude='.next/trace*' .next public app.js package.json package-lock.json
"${SSH[@]}" "mkdir -p ~/munchadoo-releases/$RELEASE && cat > ~/munchadoo-releases/$RELEASE/release.tgz" < "$BUILD/release.tgz"
"${SSH[@]}" bash -s -- "$RELEASE" <<'REMOTE'
set -euo pipefail
release="$HOME/munchadoo-releases/$1"
cd "$HOME/munchadoo"
mkdir -p "$release/backup" "$release/new" tmp
for item in .next public app.js package.json package-lock.json; do
  cp -a "$item" "$release/backup/"
done
tar -xzf "$release/release.tgz" -C "$release/new"
restore() {
  for item in .next public app.js package.json package-lock.json; do
    rm -rf "$HOME/munchadoo/$item"
    cp -a "$release/backup/$item" "$HOME/munchadoo/"
  done
  touch "$HOME/munchadoo/tmp/restart.txt"
}
trap restore ERR
for item in .next public app.js package.json package-lock.json; do
  rm -rf "$item"
  cp -a "$release/new/$item" .
done
touch tmp/restart.txt
# Verify TLS and the exact new build via a unique public asset.
asset="$(find "$release/new/.next/static" -type f -name '*.js' -print -quit)"
asset_path="${asset#"$release/new/.next/static/"}"
for attempt in 1 2 3 4 5; do
  if curl -fsS --max-time 20 --resolve munchadoo.com:443:162.213.255.108 https://munchadoo.com/ -o "$release/home.html" && grep -qi munchadoo "$release/home.html" && curl -fsS --max-time 20 --resolve munchadoo.com:443:162.213.255.108 "https://munchadoo.com/_next/static/$asset_path" -o "$release/asset.js" && cmp -s "$asset" "$release/asset.js"; then
    trap - ERR
    echo "Published $1; HTTPS and build asset verified. Backup: $release/backup"
    exit 0
  fi
  sleep 3
done
false
REMOTE
