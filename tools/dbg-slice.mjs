import fs from "node:fs";
let src = fs.readFileSync(new URL("./gen-molecules.mjs", import.meta.url), "utf8");
const i = src.indexOf("async function fetchSDF");
const j = src.indexOf("// ---------- 主流程");
console.log("len=" + src.length + " i=" + i + " j=" + j);
console.log("head: " + JSON.stringify(src.slice(i, i + 60)));
console.log("tail: " + JSON.stringify(src.slice(j - 20, j + 20)));
