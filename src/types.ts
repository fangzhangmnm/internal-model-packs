// types.ts —— 模型包清单的形状（模型仓 packs/<slug>/manifest.json 里本库用到的部分；别的字段原样带着）。created 2026-10-07 by Claude Opus 5.5
// 是 @internal/read-aloud src/packs.ts 里 PackManifest / EmbeddedPack 的子集：宿主手上朗读库的对象直接能传进来。

/** 一片：模型仓按 24 MiB 切。 */
export interface PackChunk { name: string; bytes: number; sha256: string }
/** 模型仓 manifest.json（本库只认这几个字段）。 */
export interface PackManifest {
  slug: string;
  chunks: PackChunk[];
  totalBytes: number;
  [k: string]: unknown;
}
/** 宿主内嵌进 bundle 的一个包：packId（= manifest.json 的 sha256）是信任根。 */
export interface EmbeddedPack { packId: string; manifest: PackManifest }
