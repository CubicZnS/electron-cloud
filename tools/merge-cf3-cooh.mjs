// merge-cf3-cooh.mjs — 从 PubChem 提取 CF3（三氟甲苯）与 COOH（苯甲酸）碎片，合并进 MOLECULE_DATA
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// 复用 gen-molecules.mjs 的提取函数
let src = fs.readFileSync(new URL("./gen-molecules.mjs", import.meta.url), "utf8");
const i = src.indexOf("async function fetchSDF");
const j = src.indexOf("// ---------- 主流程");
const code = src.slice(i, j);
const m = {};
new Function("module", "exports", "require", code + "\nmodule.exports={fetchSDF,parseSDF,extractFragments};")(m, m.exports, require);
const { fetchSDF, parseSDF, extractFragments } = m.exports;

const TARGETS = [
  { name: "benzotrifluoride", key: "CF3", zh: "三氟甲苯", formula: "C7H5F3", en: "Benzotrifluoride" },
  { name: "benzoic acid", key: "COOH", zh: "苯甲酸", formula: "C7H6O2", en: "Benzoic acid" },
];

const dataPath = path.join(import.meta.dirname, "..", "parts", "02_data.js");
const raw = fs.readFileSync(dataPath, "utf8");
const DATA = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));

let changed = false;
for (const t of TARGETS){
  try {
    const sdf = await fetchSDF(t.name);
    const mol = parseSDF(sdf);
    const ex = extractFragments(mol);
    if (!ex.fragments.length) throw new Error("no fragment");
    const frag = ex.fragments[0];
    DATA.fragments[t.key] = { atoms: frag.atoms, bonds: frag.bonds, attachOrder: frag.attachOrder };
    DATA.molecules[t.key === "CF3" ? "benzotrifluoride" : "benzoicacid"] = {
      name: t.en, zh: t.zh, formula: t.formula, fragments: [{ pos: frag.pos, group: t.key }],
    };
    changed = true;
    console.log("OK " + t.key + " frag atoms=" + frag.atoms.length + " attach=" + Math.hypot(...frag.atoms[0].p).toFixed(3) + " pos=" + frag.pos);
  } catch (e) {
    console.log("FAIL " + t.key + ": " + e.message);
  }
}
if (changed){
  const js = "const MOLECULE_DATA = " + JSON.stringify(DATA) + ";";
  fs.writeFileSync(dataPath, js, "utf8");
  console.log("written, fragments now: " + Object.keys(DATA.fragments).join(","));
} else {
  console.log("no changes");
}
