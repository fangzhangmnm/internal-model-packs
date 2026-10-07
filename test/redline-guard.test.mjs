// 红线守卫（机械执法）：本库只有 pack-store.ts 联网、只有它碰 Cache Storage；全库不碰 localStorage / sessionStorage / IndexedDB / DOM。
// created 2026-10-07 by Claude Opus 5.5
import { describe, it, eq } from "./runner.mjs";
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src");
const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".ts")).map((f) => [f, fs.readFileSync(path.join(SRC, f), "utf8").replace(/\/\/.*$/gm, "")]);
describe("红线", () => {
  it("只有 pack-store.ts 联网、碰 Cache Storage", () => {
    for (const [f, s] of files) if (f !== "pack-store.ts") { eq(/\bfetch\s*\(/.test(s), false, `${f} 联网`); eq(/\bcaches\./.test(s), false, `${f} 碰缓存`); }
  });
  it("全库不碰别的存储、不碰 DOM", () => {
    for (const [f, s] of files) { eq(/localStorage|sessionStorage|indexedDB|IDBFactory/.test(s), false, `${f} 碰存储`); eq(/\bdocument\./.test(s), false, `${f} 碰 DOM`); }
  });
  it("缓存名默认 pwa-models、键在 /__pwa-models__/ 下", () => {
    const s = files.find(([f]) => f === "pack-store.ts")[1];
    eq(/cacheName \?\? "pwa-models"/.test(s), true); eq(/\/__pwa-models__\//.test(s), true);
  });
});
