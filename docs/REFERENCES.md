# External References

> 复用/借鉴资源清单。所有复用代码的 License 已核对；内嵌的 shader 代码（Ashima simplex noise）为 MIT 许可并保留作者署名注释。

## Resource 1
- Name: three.js（含 examples：OrbitControls / EffectComposer / RenderPass / UnrealBloomPass / OutputPass）
- URL: https://github.com/mrdoob/three.js （版本 0.161.0，CDN: https://cdn.jsdelivr.net/npm/three@0.161.0/）
- License: MIT
- Used for: 渲染内核、相机控制、后期 bloom（UnrealBloomPass + OutputPass + ACES tone mapping）
- Modified parts: 未修改；通过 importmap 直接引入

## Resource 2
- Name: webgl_gpgpu_curl（three.js 官方示例，Curl Noise 粒子）
- URL: https://threejs.org/examples/webgl_gpgpu_curl.html
- License: MIT
- Used for: 参考 curl-noise 粒子运动思路（本项目改为顶点着色器实现，未直接使用 FBO）
- Modified parts: 思路借鉴，代码独立实现

## Resource 3
- Name: Ashima Arts / Stefan Gustavson — Simplex noise（GLSL snoise vec3）
- URL: https://github.com/ashima/webgl-noise （经典实现；附 Simplex noise demystified 论文）
- License: MIT
- Used for: 粒子微动/呼吸/流动的噪声场（snoise、snoiseVec3、curlNoise 内嵌于 vertex shader）
- Modified parts: 原样内嵌并保留作者注释；curlNoise 有限差分包装为自写

## Resource 4
- Name: Curl Noise for Procedural Fluid Flow（Bridson, Hourrihane, Nordenstam, SIGGRAPH 2007）
- URL: https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-curlnoise.pdf
- License: 学术文章（方法）
- Used for: 粒子流动场的 curl 噪声方法依据
- Modified parts: 方法学引用

## Resource 5
- Name: PubChem REST API — 3D conformer（SDF）
- URL: https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/<NAME>/SDF?record_type=3d
- License: 公开数据（美国 NIH 公共领域数据库数据）
- Used for: 10 个演示分子的原子坐标/键序（benzene, toluene, anisole, phenol, aniline, fluorobenzene, chlorobenzene, benzonitrile, nitrobenzene, benzaldehyde）；正则化到苯环坐标系后内嵌
- Modified parts: 坐标正则化（苯环取正六边形、z=0）、碎片化（以 ipso 碳为原点存储取代基相对坐标）

## Resource 6
- Name: juniorxsound/Particle-Curl-Noise
- URL: https://github.com/juniorxsound/Particle-Curl-Noise
- License: MIT
- Used for: 视觉/参数参考（curl noise 粒子表现）
- Modified parts: 未集成代码

## Resource 7
- Name: rdkit/rdkit-js（RDKit.js WebAssembly）
- URL: https://github.com/rdkit/rdkit-js
- License: BSD-3
- Used for: 评估为 SMILES→3D 坐标方案；最终未采用（10 个固定分子由 PubChem 预生成，避免 ~10MB wasm 依赖），记录备选
- Modified parts: —

## Resource 8
- Name: 3Dmol.js（分子可视化库）
- URL: https://github.com/3dmol/3Dmol.js
- License: BSD-3
- Used for: 评估分子渲染方案；最终未采用（自定义粒子层与动画管线深度耦合），记录备选
- Modified parts: —

## Resource 9
- Name: morbvis（WebGL 分子轨道查看器）
- URL: https://github.com/Yasuaki-Ito/morbvis
- License: MIT
- Used for: 电子分布可视化视觉参考
- Modified parts: —

## Resource 10
- Name: compartia/hydrogen（氢原子轨道可视化）
- URL: https://github.com/compartia/hydrogen
- License: MIT
- Used for: 轨道/电子云粒子视觉参考
- Modified parts: —

## Resource 11
- Name: dsh-worktable 原生皮肤（dshell.css / dshell.html 模板）
- URL: http://127.0.0.1:3080/api/worktable/template/dshell.css （本机工作台插件提供）
- License: 工作台插件自带（本机使用）
- Used for: 页面 UI 组件类（dshell-tabs/dshell-tab/dshell-btn/dshell-badge/dshell-card 等），随主题自动适配
- Modified parts: 仅引用样式表，未复制其 CSS
## Resource 12
- Name: matplotlib perceptually-uniform colormaps（plasma / inferno / viridis）
- URL: https://matplotlib.org/stable/users/explain/colors/colormaps.html
- License: BSD (matplotlib)
- Used for: 电子云按电子密度着色的科学色图（默认 Plasma；可选 Inferno/Viridis），现代分子可视化工具（Mol*、SAMSON 等）普遍采用感知均匀色图规范
- Modified parts: 以 8 个锚点色重建 256 级 LUT（DataTexture），未复制其代码

## Resource 13
- Name: ChimeraX / PyMOL 静电势（electrostatic potential）蓝↔红分叉色规范
- URL: https://www.cgl.ucsf.edu/chimerax/docs/user/colortables.html （ChimeraX 用户文档）
- License: 规范引用（视觉惯例）
- Used for: Cool-Warm 色图（蓝=低密度，红=高密度），化学可视化社区公认的双端色规范
- Modified parts: 规范借鉴

## Resource 14
- Name: 体渲染密度图对数压缩惯例（log-scaled density mapping）
- URL: https://www.rbvi.ucsf.edu/chimerax/ （ChimeraX 体数据渲染）
- License: 规范引用
- Used for: 电子密度场经 log1p 压缩 + 固定标度归一化，再经 256 级 LUT 映射为粒子颜色；保证不同分子/取代状态间颜色可比
- Modified parts: 规范借鉴
## Resource 15
- Name: three.js 论坛 — Morphing between geometries of Points system on GPU
- URL: https://discourse.threejs.org/t/morphing-between-geometries-of-points-system-on-gpu/37688
- License: 讨论/技术方案（论坛内容）
- Used for: 电子云过渡的「粒子对应匹配」思路：新旧分布按空间（0.6Å 格批量贪心最近邻 + 3D Morton 序秩匹配兜底）一一对应，使官能团切换时电子云呈连续流动而非打乱重排；对应关系保持双射
- Modified parts: 方法借鉴，代码独立实现（Morton key 8bit 展开 + 格哈希）
## Resource 16
- Name: Hammett 方程（σ 常数与多取代加和律）
- URL: https://en.wikipedia.org/wiki/Hammett_equation ；Jaffé, H. H., Chem. Rev. 1953, 53, 191（综述）
- License: 学术理论/文献数据
- Used for: 电子效应定量框架；多取代体系按 Σσ 加和预测（LFER 标准方法）
- Modified parts: 数据采用（σ_m/σ_p 标准值）

## Resource 17
- Name: Taft 双取代基参数（σ_I / σ_R 分解）
- URL: https://www.sciencedirect.com/topics/chemistry/reaction-rate-constant （Taft 分解综述）
- License: 学术理论
- Used for: 诱导(σ_I/σ_m)与共振(σ_R)分离，支撑 Inductive/Resonance 模式分解
- Modified parts: 数据采用（σ_I、σ_R⁰、σ_R⁻/σ_R⁺ 标准值）

## Resource 18
- Name: Yukawa–Tsuno 方程（σ⁺/σ⁻ 共振增强）
- URL: https://en.wikipedia.org/wiki/Yukawa-Tsuno_equation ；IUPAC Gold Book: https://goldbook.iupac.org/terms/view/Y06734
- License: 学术理论
- Used for: 推-拉（供体-受体）体系的共振增强项（r=1 简化）
- Modified parts: 简化实现

## Resource 19
- Name: Brown–Okamoto σ⁺ 常数（1968）
- URL: 标准 σ 常数汇编（Hansch-Leo: Exploring QSAR）
- License: 文献数据
- Used for: 供体基团的推-拉增强常数（σ⁺）
- Modified parts: 数据采用

## Resource 20
- Name: Lucide Icons — Plus（加号图标）
- URL: https://lucide.dev/icon/plus （SVG path: M5 12h14 / M12 5v14）
- License: ISC
- Used for: 创造模式入口按钮的加号图标（内联 SVG，stroke 继承当前颜色）
- Modified parts: 原样内嵌两个 path，未引入完整图标库

## Resource 21
- Name: Hinze & Jaffé — "Electronegativity. I. Orbital Electronegativity of Neutral Atoms"（1962, JACS）
- URL: https://scite.ai/reports/b-electronegativity-i-orbital-electronegativity-of-ppn49w （原始文献索引）；数值亦载于多本有机化学教材
- License: 文献数据
- Used for: 创造模式碳架基线——杂化轨道电负性 C(sp3)=7.98、C(sp2)=8.79、C(sp)=10.39 eV（Mulliken）→ 相对 1.000/1.101/1.302
- Modified parts: 取比值，未修改数值

## Resource 22
- Name: Bent's rule / Orbital hybridisation（s 成分 ↑ → 轨道电负性 ↑，sp > sp² > sp³）
- URL: https://en.wikipedia.org/wiki/Bent%27s_rule
- License: CC BY-SA（百科条目，观点为经典文献共识）
- Used for: 杂化因子方向的依据（高 s 成分碳电负性更强）
- Modified parts: 仅采用趋势结论

## Resource 23
- Name: Pauling 电负性（C = 2.55, H = 2.20）
- URL: 标准电负性表（Pauling, The Nature of the Chemical Bond, 1960）
- License: 文献数据（公共常识数值）
- Used for: C–H 键极化方向——碳偏负、氢偏正 → 每多一个 C–H 键碳更富电子
- Modified parts: 方向采用；每键幅度为校准常数（+0.07），量级锚定 Resource 24

## Resource 24
- Name: 烷烃碳部分电荷分析（ESP / Mulliken / NBO；如 Can. J. Chem. "Charge distributions and chemical effects. XXXVI… application to alkanes", 1985；Gasteiger–Marsili 电荷均衡法, Tetrahedron 1980）
- URL: http://www.nrcresearchpress.com/doi/pdf/10.1139/v85-292
- License: 文献数据
- Used for: C–H 极化项幅度的半定量锚定（propane 的 CH₃ 碳明显负于 CH₂ 碳，约几 % 量级差异）
- Modified parts: 仅锚定量级，未逐点复算

## Resource 25
- Name: Hückel 规则（4n+2 芳香性）与 Kekulé 结构约定
- URL: https://en.wikipedia.org/wiki/H%C3%BCckel%27s_rule
- License: CC BY-SA（百科条目，观点为经典有机化学共识）
- Used for: 创造模式芳香化检测——交替单双键环仅当环长为 4n+2（6/10/14…）时升为芳香键 1.5；4n 环（环丁二烯等反芳香）保持 Kekulé 不转化
- Modified parts: 采用判据，未修改规则

## Resource 26
- Name: Lucide Icons — Atom（原子图标）
- URL: https://lucide.dev/icon/atom
- License: ISC
- Used for: Quantum Data 导入入口按钮的内联 SVG（圆圈 + 两条椭圆轨道），stroke 继承当前颜色
- Modified parts: 原样内嵌三个 path（circle + 2 条 ellipse 路径），未引入完整图标库

## Resource 27
- Name: Gaussian Cube file format 规范（cubegen 输出格式）
- URL: https://gaussian.com/cubegen/ （官方 cubegen 手册）；格式概述：https://en.wikipedia.org/wiki/Cube_(file_format)
- License: 公开格式规范（事实标准）
- Used for: Cube 解析器（parts/03b_cube.js）——两行注释、原子数/原点、三轴、原子列表、体素标量值；体素按 x 最快顺序 index = ix + nx·iy + nx·ny·iz；负原子数 = 多数据集（拒绝）
- Modified parts: 规范实现

## Resource 28
- Name: Multiwfn — cube 文件导出（"Export result to cube file"）
- URL: http://sobereva.com/multiwfn （Multiwfn 主页与手册）
- License: 开源软件（文档公开）
- Used for: 识别 Multiwfn 导出 Cube 的「数据集计数」行（单数据集 = 1）并兼容；对多数据集/多轨道合并给出明确拒绝提示
- Modified parts: 兼容逻辑（仅当剩余 token 数 = 1 + nVox 或 1 + k·nVox 时视为数据集计数，不误伤标准 cubegen 输出）

## Resource 29
- Name: 共价半径（Cordero et al., "Covalent radii revisited", Dalton Trans., 2008）
- URL: https://pubs.rsc.org/en/content/articlelanding/2008/dt/b801115j
- License: 文献数据（公开科学数据）
- Used for: 导入 Cube 后「视觉单键推断」（元素 + 距离 + 共价半径和 + 0.45Å 容差），仅供骨架流动路径，不声称是量子计算输出的键级
- Modified parts: 采用数值子集；未知元素回退默认 0.90Å

## Resource 30
- Name: 玻尔半径（bohr→Å 换算，CODATA 2018：1 bohr = 0.529177210903 Å）
- URL: https://physics.nist.gov/cuu/Constants/
- License: 公开标准数据（NIST）
- Used for: Cube 原子单位坐标/原点/轴 → 项目 Å 坐标系；元素符号表（原子序数→符号）为公开标准数据
- Modified parts: 数值采用；统一按网格中心居中
