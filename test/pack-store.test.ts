// @internal/model-packs：下载 / 续传 / 校验失败 / 导入 / 整包导入 / 删除 / 重打包作废 / sha256。created 2026-10-07 by Claude Opus 5.5
import { describe, it, eq } from "./runner.mjs";
import { installFakeWeb } from "./fake-web.mjs";
import { createPackStore, Sha256, type EmbeddedPack } from "../src/index.ts";

const web = installFakeWeb();
const enc = (s: string) => new TextEncoder().encode(s);
const hex = (s: string) => new Sha256().update(enc(s)).hex();
const BASE = "https://models.test/pwa-models";
const C0 = "hello", C1 = "abc";
const manifest = { slug: "t-pack", totalBytes: 8, chunks: [{ name: "chunk-000", bytes: 5, sha256: hex(C0) }, { name: "chunk-001", bytes: 3, sha256: hex(C1) }] };
const pack = (packId: string): Record<string, EmbeddedPack> => ({ "t-pack": { packId, manifest } });
const serve = (c0 = C0, c1 = C1) => { web.files.set(`${BASE}/packs/t-pack/chunk-000`, enc(c0)); web.files.set(`${BASE}/packs/t-pack/chunk-001`, enc(c1)); };
const text = async (bs: Blob[]) => (await Promise.all(bs.map((b) => b.text()))).join("");
const fresh = async () => { const s = createPackStore({ packs: pack("id1") }); await s.delete(["t-pack"]); web.calls.length = 0; return s; };

describe("sha256", () => {
  it("标准向量", () => {
    eq(hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    eq(hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("pack store", () => {
  it("下载：逐片验过、盖章、就绪；取分片 = 原字节", async () => {
    serve(); const s = await fresh();
    eq((await s.status(["t-pack"]))[0].ready, false);
    const st = await s.download(["t-pack"], BASE);
    eq(st[0].ready, true); eq(st[0].bytesCached, 8); eq(await text(await s.chunks("t-pack")), "helloabc");
  });
  it("续传：已经在缓存里的分片不重取", async () => {
    serve(); const s = await fresh(); await s.download(["t-pack"], BASE);
    await web.cache()!.delete("https://app.test/__pwa-models__/t-pack/chunk-001"); web.calls.length = 0;
    await s.download(["t-pack"], BASE); eq(web.calls.join(), `${BASE}/packs/t-pack/chunk-001`);
  });
  it("源被改过（哈希对不上）：报错、不就绪", async () => {
    serve("hellx"); const s = await fresh(); let msg = "";
    try { await s.download(["t-pack"], BASE); } catch (e) { msg = (e as Error).message; }
    eq(/sha256 mismatch/.test(msg), true); eq((await s.status(["t-pack"]))[0].ready, false);
  });
  it("导入：按内容哈希认分片（文件名不作数）；也认整包一个文件；认不出 = no-matching-file", async () => {
    let s = await fresh();
    let st = await s.importFiles(["t-pack"], [new File([C1], "x.bin"), new File([C0], "y.bin"), new File(["{}"], "manifest.json")]);
    eq(st[0].ready, true);
    s = await fresh(); st = await s.importFiles(["t-pack"], [new File([C0 + C1], "whole.bin")]); eq(st[0].ready, true);
    s = await fresh(); let msg = ""; try { await s.importFiles(["t-pack"], [new File(["zz"], "z.bin")]); } catch (e) { msg = (e as Error).message; }
    eq(msg, "no-matching-file");
  });
  it("删除：分片和「已验」章都没了", async () => {
    serve(); const s = await fresh(); await s.download(["t-pack"], BASE); await s.delete(["t-pack"]);
    eq((await s.status(["t-pack"]))[0].ready, false); eq((await s.status(["t-pack"]))[0].bytesCached, 0);
  });
  it("同 slug 重打包过（packId 变了）：旧分片作废重下", async () => {
    serve(); const s1 = await fresh(); await s1.download(["t-pack"], BASE);
    const s2 = createPackStore({ packs: pack("id2") });
    eq((await s2.status(["t-pack"]))[0].ready, false);
    web.calls.length = 0; await s2.download(["t-pack"], BASE); eq(web.calls.length, 2); eq((await s2.status(["t-pack"]))[0].ready, true);
  });
  it("没就绪就取分片 = pack-missing；不认识的包 = 报错", async () => {
    const s = await fresh(); let m1 = "", m2 = "";
    try { await s.chunks("t-pack"); } catch (e) { m1 = (e as Error).message; }
    try { await s.status(["nope"]); } catch (e) { m2 = (e as Error).message; }
    eq(m1, "pack-missing"); eq(m2, "unknown pack: nope");
  });
});
