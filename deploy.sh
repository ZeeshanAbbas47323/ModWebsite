#!/usr/bin/env bash
# One-shot frontend deploy: pulls latest code, clears every cache layer that
# can serve stale HTML/CSS/API data, rebuilds, and restarts.
#
# Run this ON THE SERVER, from the frontend/ directory:
#   ./deploy.sh
#
# Change PM2_NAME below if your process isn't named "modfirst-frontend"
# (check with: pm2 list)

set -euo pipefail
cd "$(dirname "$0")"

PM2_NAME="${PM2_NAME:-modfirst-frontend}"

echo "==> Pulling latest code"
git pull

echo "==> Installing dependencies"
npm ci

echo "==> Clearing Next.js build + data cache (this is what was serving stale menus/images/CSS)"
rm -rf .next

echo "==> Building"
npm run build

echo "==> Restarting ($PM2_NAME)"
pm2 restart "$PM2_NAME" || pm2 start npm --name "$PM2_NAME" -- start

echo "==> Done. Verify:"
echo "    - Product detail page is responsive, gallery/thumbnails match homepage colors"
echo "    - Homepage hero rotates through all 9 slides"
echo "    - Header nav has no 'DTG Printing Service' item, no 404s on click"
