// 组装 electron-cloud 单文件 index.html（parts 01→08 顺序拼接）
// 用法：node tools/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORDER = ["01_head.html", "02_data.js", "03_core.js", "03b_cube.js", "03c_crystal.js", "03d_crystal_templates.js", "04_glsl.js", "05_render.js", "05c_crystal_render.js", "06_ui.js", "06b_cube_ui.js", "06c_crystal_ui.js", "07_main.js", "08_tail.html"];
let out = "";
for (const f of ORDER) out += readFileSync(join(ROOT, "parts", f), "utf8") + "\n";
writeFileSync(join(ROOT, "index.html"), out);
console.log("assembled index.html:", out.length, "bytes");

// 语法检查：JS 部分（02–07）拼成临时文件交给 node --check
const js = ORDER.slice(1, ORDER.length - 1).map(f => readFileSync(join(ROOT, "parts", f), "utf8")).join("\n");
const tmp = join(ROOT, ".syntax-check.js");
writeFileSync(tmp, js);
const r = spawnSync(process.execPath, ["--check", tmp], { encoding: "utf8" });
if (r.status !== 0){
  console.error("SYNTAX ERROR:\n" + (r.stderr || r.stdout));
  process.exit(1);
}
console.log("SYNTAX_OK");
