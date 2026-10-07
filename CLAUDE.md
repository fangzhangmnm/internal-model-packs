# 20261007 internal-model-packs — 本库规则（@internal/model-packs）

家族总规则见 `../CLAUDE.md`。created 2026-10-07 by Claude Opus 5.5。

出生依据：user 2026-10-07「抽共享库同意」（月读模型照家规进 pwa-models，几个 app 共用一份）。
源 = JustReadBooks `src/model-packs.ts` + `src/sha256.ts`（Claude Fable 5.1，2026-10-06；更早来自 @internal/read-aloud 0.1.19 与 WebXiaoHeiWu `src/asr/`）。算法一字未改。

- **本库 = 模型包的字节层**：按宿主内嵌的包清单（packId = 信任根）下载分片、逐片 sha256、存进 Cache Storage `pwa-models`、用户导入（按内容哈希认领）、删除、取分片（Blob）。引擎怎么用这些字节是宿主 / 引擎库的事。
- **红线（`test/redline-guard.test.mjs` 机械执法）**：
  - 只有 `src/pack-store.ts` 联网：只读 GET 模型源的分片，到手先对清单的 sha256，对不上整包拒收。
  - 只有它碰 Cache Storage；默认缓存名 `pwa-models`（家族共享，同域名的兄弟 app 自动共用），键 = 本 origin 下的合成路径 `/__pwa-models__/<slug>/<chunk>`，永不真的去 fetch 这个路径。
  - 只写 / 删自己内嵌清单认得的包（家族 CLAUDE.md「共享模型库 · 命名与共享规矩」第 2 条）；全库不碰 localStorage / sessionStorage / IndexedDB / DOM。
  - 哈希是流式 Sha256（user 2026-09-03：不用 crypto.subtle.digest，切片大小不绑内存）。
- **版本纪律同其他内部库**：现行 `0.1.0`（2026-10-07 首发，user 批推送清单「做」）；**默认只 bump patch**（user 2026-10-01「我不说你就只bump patch，不要动minor」）；版本号只在 user 过目真实导出面（`api/`）之后才写；收货脚本只认打过 tag 的已发版；bump minor 之前必须 user 批。
- **只出货不送货**：本库的活到 commit 交付物为止；宿主收货、跑宿主测试、宿主发版是宿主 session 的活。
- 测试：`npm test`（node；`test/fake-web.mjs` 装一个最小的假 Cache Storage 和假 fetch）。构建 + 户口：`npm run build`（`api/` = dist 的 .d.ts 纯签名树）。
- 开发期往宿主里装包只许用 `scripts/dev-install.sh`（原因见脚本头注释）。
- `journal/`、`journals/` 是人类区，AI 永不写。
