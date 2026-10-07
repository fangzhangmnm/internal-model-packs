#!/usr/bin/env bash
# 构建：tsc 发射 dist/（.js + .d.ts）——tsc 本身就是类型门。抄 internal-reference-window。created 2026-10-07 by Claude Opus 5.5
# 户口（家族 API .h ritual）：dist/*.d.ts 拷进 api/（纯签名树，git diff 即审核面）。
set -euo pipefail
cd "$(dirname "$0")/.."
echo "[build] tsc → dist/"
rm -rf dist
npx tsc -p tsconfig.json
echo "[build] done: $(find dist -name '*.js' | wc -l) js / $(find dist -name '*.d.ts' | wc -l) d.ts"
js_total=$(find dist -name '*.js' -exec du -cb {} + | tail -1 | cut -f1)
echo "[体重] dist js 合计 $((js_total / 1024)) KB"
rm -rf api && mkdir -p api && (cd dist && find . -name '*.d.ts' -exec cp --parents {} ../api/ \;)
echo "[户口] api/*.d.ts 已刷新"
