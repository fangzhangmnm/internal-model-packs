# @internal/model-packs

PWA 家族模型包的字节层。宿主在 build 时把模型仓（`fangzhangmnm/pwa-models`）的包清单内嵌进来，本库照清单：

- `download(slugs, base)`：从模型源下载分片，逐片 sha256 校验，存进 Cache Storage `pwa-models`；可续传。
- `importFiles(slugs, files)`：用户自己拿到的文件，按内容哈希认是哪个包的哪一片（文件名不作数）；整包一个文件也认。
- `status(slugs)` / `delete(slugs)` / `chunks(slug)`：查状态、删除、取分片（Blob，喂给引擎）。

同一个域名下的兄弟 app 共用这一份缓存（例如朗读和唱歌都用月读的同一份权重，只下一次）。

```ts
import { createPackStore } from "@internal/model-packs";
const store = createPackStore({ packs: EMBEDDED_PACKS });   // { [slug]: { packId, manifest } }
await store.download(["voice-…", "lang-ja-…"], "https://fangzhangmnm.github.io/pwa-models", (p) => show(p.done / p.total));
const blobs = await store.chunks("voice-…");
```

created 2026-10-07 by Claude Opus 5.5（源 = JustReadBooks `src/model-packs.ts`，Claude Fable 5.1）。
