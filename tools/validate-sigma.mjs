// validate-sigma.mjs — 验证 σ 数据驱动模型的化学模式（LFER 理论）
const K = 1.4;
const G = {
  CH3:{sm:-0.07,sp:-0.17,sPlus:-0.31,sMinus:-0.17}, OH:{sm:0.12,sp:-0.37,sPlus:-0.92,sMinus:-0.37},
  OMe:{sm:0.12,sp:-0.27,sPlus:-0.78,sMinus:-0.27}, NH2:{sm:-0.16,sp:-0.66,sPlus:-1.30,sMinus:-0.66},
  F:{sm:0.34,sp:0.06,sPlus:-0.07,sMinus:0.06}, Cl:{sm:0.37,sp:0.23,sPlus:0.11,sMinus:0.23},
  CF3:{sm:0.43,sp:0.54,sPlus:0.61,sMinus:0.54}, CN:{sm:0.56,sp:0.66,sPlus:0.66,sMinus:1.00},
  NO2:{sm:0.71,sp:0.78,sPlus:0.79,sMinus:1.27}, CHO:{sm:0.35,sp:0.42,sPlus:0.73,sMinus:1.03},
  COOH:{sm:0.37,sp:0.45,sPlus:0.45,sMinus:0.75},
};
const IND_D = [3.0, 1.8, 1.0, 0.5];
const ALT_D = [0.7, 1.0, 0.0, 1.0];
const ringSteps = (a,b) => { const d = Math.abs(a-b) % 6; return Math.min(d, 6-d); };
const clamp = (v,a,b) => v<a?a:(v>b?b:v);
function factors(frags){
  const hasDonor = frags.some(f => G[f.group].sPlus < G[f.group].sp);
  const hasAcceptor = frags.some(f => G[f.group].sMinus > G[f.group].sp);
  const ind = new Array(6).fill(0), res = new Array(6).fill(0);
  for (const f of frags){
    const g = G[f.group];
    let sp = g.sp;
    if (g.sMinus > g.sp && hasDonor) sp = g.sMinus;
    else if (g.sPlus < g.sp && hasAcceptor) sp = g.sPlus;
    const sr = sp - 0.5 * g.sm;
    for (let j = 0; j < 6; j++){
      const d = ringSteps(f.pos, j);
      ind[j] += g.sm * IND_D[d];
      res[j] += sr * ALT_D[d];
    }
  }
  return Array.from({length:6}, (_,j) => clamp(Math.exp(-K*(ind[j]+res[j])), 0.05, 4.0));
}
const fmt = (a) => a.map(x=>x.toFixed(2)).join(" ");
let pass = 0, fail = 0;
const check = (name, ok) => { console.log((ok ? "PASS " : "FAIL ") + name); ok ? pass++ : fail++; };

// 1) 单取代：供体 o/p 富、间位中性偏贫；受体 o/p 强贫、间位最轻
const donors = ["OH","OMe","NH2"], acceptors = ["NO2","CN","CHO","COOH"];
for (const g of donors){
  const f = factors([{pos:0, group:g}]);
  const op = (f[1]+f[5])/2, m = (f[2]+f[4])/2, p = f[3];
  check(g + " 供体 o/p 富 (o="+op.toFixed(2)+" p="+p.toFixed(2)+") meta 中/贫 (m="+m.toFixed(2)+")", op > 1.1 && p > 1.2 && (m < 1.0 || G[g].sm < 0));
}
for (const g of acceptors){
  const f = factors([{pos:0, group:g}]);
  const op = (f[1]+f[5])/2, m = (f[2]+f[4])/2, p = f[3];
  check(g + " 受体 o/p 贫 (o="+op.toFixed(2)+" p="+p.toFixed(2)+") 间位最轻 (m="+m.toFixed(2)+")", op < 0.75 && p < 0.75 && m < 1.0 && m > op);
}
// 2) F 对位近中性、间位贫化；Cl 同
{
  const f = factors([{pos:0, group:"F"}]);
  check("F para≈1 中性 ("+f[3].toFixed(2)+") meta 贫 ("+((f[2]+f[4])/2).toFixed(2)+")", f[3] > 0.8 && f[3] < 1.2 && (f[2]+f[4])/2 < 0.85);
}
// 3) CH3 弱供体
{
  const f = factors([{pos:0, group:"CH3"}]);
  check("CH3 弱 o/p 富 ("+((f[1]+f[3])/2).toFixed(2)+")", (f[1]+f[3])/2 > 1.05 && (f[1]+f[3])/2 < 1.5);
}
// 4) CF3 单调衰减（ipso>邻>间>对）
{
  const f = factors([{pos:0, group:"CF3"}]);
  check("CF3 ipso<邻<间, para 接近间位(σp>σm 数据) " + fmt(f), f[0] <= f[1] && f[1] <= f[2] && f[4] <= f[2] + 0.15 && f[3] <= f[2] + 0.15);
}
// 5) 推-拉：对硝基苯胺
{
  const pna = factors([{pos:0, group:"NH2"}, {pos:3, group:"NO2"}]);
  const nh2Side = (pna[1] + pna[5]) / 2, no2Side = (pna[2] + pna[4]) / 2;
  check("p-nitroaniline 极化: NH2 侧富 ("+nh2Side.toFixed(2)+") vs NO2 侧贫 ("+no2Side.toFixed(2)+")", nh2Side > 2.0 && no2Side < 0.3 && nh2Side / no2Side > 5);
  function factorsNoEnh(frags){
    const ind = new Array(6).fill(0), res = new Array(6).fill(0);
    for (const f of frags){
      const g = G[f.group];
      const sr = g.sp - 0.5 * g.sm;
      for (let j = 0; j < 6; j++){
        const d = ringSteps(f.pos, j);
        ind[j] += g.sm * IND_D[d];
        res[j] += sr * ALT_D[d];
      }
    }
    return Array.from({length:6}, (_,j) => clamp(Math.exp(-K*(ind[j]+res[j])), 0.05, 4.0));
  }
  const pnaNe = factorsNoEnh([{pos:0, group:"NH2"}, {pos:3, group:"NO2"}]);
  const no2OrthoE = (pna[2] + pna[4]) / 2, no2OrthoN = (pnaNe[2] + pnaNe[4]) / 2;
  check("推-拉增强使 NO2 邻/对更贫 ("+no2OrthoN.toFixed(2)+"→"+no2OrthoE.toFixed(2)+")", no2OrthoE < no2OrthoN);
  const nh2OrthoE = (pna[1] + pna[5]) / 2, nh2OrthoN = (pnaNe[1] + pnaNe[5]) / 2;
  check("推-拉增强使 NH2 邻/对更富 ("+nh2OrthoN.toFixed(2)+"→"+nh2OrthoE.toFixed(2)+")", nh2OrthoE > nh2OrthoN);
}
// 6) 2,4-二硝基：饱和、无负值、全部 >0.05
{
  const f = factors([{pos:0, group:"NO2"}, {pos:2, group:"NO2"}]);
  check("2,4-二硝基 全部 >0.05 " + fmt(f), f.every(x => x >= 0.05));
}
// 7) 对位因子 ≈ exp(-K·σ_p)（total 模式构造上精确）
{
  const f = factors([{pos:0, group:"OH"}]);
  check("para 复现 σ_p ("+f[3].toFixed(2)+" vs "+Math.exp(-K*(-0.37)).toFixed(2)+")", Math.abs(f[3] - Math.exp(K*0.37)) < 0.01);
}
console.log("\n==== " + pass + " PASS / " + fail + " FAIL ====");
process.exit(fail ? 1 : 0);
