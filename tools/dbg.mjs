
const url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/benzene/SDF?record_type=3d";
const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
const sdf = await r.text();
console.log("status", r.status, "len", sdf.length);
console.log(JSON.stringify(sdf.slice(0, 120)));
const lines = sdf.split(/\r?\n/);
console.log("num lines", lines.length, "line3:", JSON.stringify(lines[3]), "line4:", JSON.stringify(lines[4]));
const counts = lines[3];
console.log("natoms", parseInt(counts.slice(0,3),10), "nbonds", parseInt(counts.slice(3,6),10));
const l = lines[4];
console.log("atomline:", JSON.stringify(l));
console.log("x", JSON.stringify(l.slice(0,10)), parseFloat(l.slice(0,10)));
console.log("y", JSON.stringify(l.slice(10,20)), parseFloat(l.slice(10,20)));
console.log("z", JSON.stringify(l.slice(20,30)), parseFloat(l.slice(20,30)));
console.log("el", JSON.stringify(l.slice(31,34).trim()));
