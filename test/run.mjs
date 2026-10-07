// 测试入口：node test/run.mjs（node 24 strip-types 直跑 .ts）。created 2026-10-07 by Claude Opus 5.5
import "./pack-store.test.ts";
import "./redline-guard.test.mjs";
import { run } from "./runner.mjs";
await run();
