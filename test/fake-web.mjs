// Node 里没有 Cache Storage / location：装一个最小的假的（只实现 pack-store 用到的 match / put / delete）+ 可数次数的假 fetch。
// created 2026-10-07 by Claude Opus 5.5
class FakeCache {
  map = new Map();
  async match(k) { const r = this.map.get(k); return r ? r.clone() : undefined; }
  async put(k, res) { this.map.set(k, new Response(await res.blob(), { headers: res.headers })); }
  async delete(k) { return this.map.delete(k); }
}
export function installFakeWeb() {
  const opened = new Map();
  globalThis.caches = { async open(n) { if (!opened.has(n)) opened.set(n, new FakeCache()); return opened.get(n); } };
  globalThis.location = { origin: "https://app.test" };
  const files = new Map(); const calls = [];
  globalThis.fetch = async (url) => { calls.push(String(url)); const b = files.get(String(url)); return b ? new Response(b) : new Response("nope", { status: 404 }); };
  return { files, calls, cache: (n = "pwa-models") => opened.get(n) };
}
