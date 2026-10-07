/** 一片：模型仓按 24 MiB 切。 */
export interface PackChunk {
    name: string;
    bytes: number;
    sha256: string;
}
/** 模型仓 manifest.json（本库只认这几个字段）。 */
export interface PackManifest {
    slug: string;
    chunks: PackChunk[];
    totalBytes: number;
    [k: string]: unknown;
}
/** 宿主内嵌进 bundle 的一个包：packId（= manifest.json 的 sha256）是信任根。 */
export interface EmbeddedPack {
    packId: string;
    manifest: PackManifest;
}
