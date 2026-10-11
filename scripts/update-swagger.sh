#!/usr/bin/env bash
#
# Regenerate the OpenAPI contract and the frontend API client.
#
# The backend and the Telegram Mini App have no shared dependencies, so this is
# a plain file copy between two independent lockfiles — not a workspace operation.
#
#   1. backend  (npm)  -> backend/swagger.json
#   2. copy            -> telegram-web-app/app/api/swagger.json
#   3. twa      (yarn) -> telegram-web-app/app/api/api-client.ts
#
# Never hand-edit api-client.ts; it is generated.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Generating backend/swagger.json"
cd "$ROOT/backend"
TELEGRAM_DISABLED=true npm run generate:swagger

echo "==> Copying contract to telegram-web-app/app/api/swagger.json"
# `rm` first: the two paths can be hardlinked in a working tree (git stores them
# as independent blobs), and `cp` refuses to write over "the same file".
rm -f "$ROOT/telegram-web-app/app/api/swagger.json"
cp "$ROOT/backend/swagger.json" "$ROOT/telegram-web-app/app/api/swagger.json"

echo "==> Generating telegram-web-app/app/api/api-client.ts"
cd "$ROOT/telegram-web-app"
yarn generate:api-client

echo "==> Done. Review the diff before committing:"
echo "    git diff --stat backend/swagger.json telegram-web-app/app/api/"
