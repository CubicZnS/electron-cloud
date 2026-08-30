# Research Report — 有机化合物电子效应可视化（Phase 1）

调研日期：本次开发会话。目标：为「电子云可视化」Web 项目寻找可复用的 GPU 粒子系统、噪声 shader、bloom 后处理、分子渲染方案与分子结构数据源，并确定技术方案。

## 1. 结论速览（决策）

| 环节 | 采用方案 | 理由 |
|---|---|---|
| 渲染框架 | three.js r161（原生，非 R3F） | 单文件 HTML 内嵌、无构建链；R3F 需 React 运行时与 bundler，单文件里不划算 |
| 粒子系统 | THREE.Points + BufferGeometry + ShaderMaterial，事件驱动重采样 + 顶点着色器变形/流动 | 化学场只在「官能团变化/模式切换」时改变：CPU 仅在事件时一次性计算目标分布（几十 ms），每帧 0 CPU 粒子更新；GPU 负责全部渲染与平滑迁移（attribute lerp + curl noise 微动 + 流动 swirl） |
| 噪声 | Ashima/Gustavson 3D simplex noise GLSL（MIT）+ Curl Noise 技巧（Bridson 2007 / IQ 文章） | 社区标准实现，直接内嵌 |
| 后处理 | three examples 的 EffectComposer + UnrealBloomPass + OutputPass（与 three 同版本同包分发，无版本错配风险） | 克制的电影级 bloom |
| 分子结构数据 | PubChem REST（record_type=3d）3D conformer，构建期下载解析为内嵌 JSON | 满足「使用公开数据库结构、不手画坐标」；本项目 10 个分子全部可得 |
| 分子渲染 | InstancedMesh（原子）+ InstancedMesh（化学键圆柱）+ MeshStandardMaterial + ACES tone mapping | 原子/键数量 ≤ 40，仍用实例化避免大量独立 Mesh |
| UI | 工作台原生皮肤 dshell.css 组件类 + 极少量自定义玻璃面板样式 | 遵循工作台要求，与 DSH 风格统一 |
| 交互/调试 | 自绘极简 UI + ?debug=1 调试面板（粒子数/亮度/噪声/流动/bloom/过渡速度/诱导/共轭强度） | leva 需额外 CDN 依赖，自定义面板零依赖且生产可隐藏 |

## 2. GPU 粒子系统候选（调研结果）

- **three.js 官方示例 webgl_gpgpu_curl（Curl Noise）**：GPUComputationRenderer 做 curl-noise 粒子。License：MIT。结论：参考其 curl noise 与 FBO 思路，但本项目不采用每帧 GPGPU（见决策表理由）。URL: https://threejs.org/examples/webgl_gpgpu_curl.html
- **juniorxsound/Particle-Curl-Noise**：three.js curl noise 粒子实验。License：MIT。结论：视觉参考。URL: https://github.com/juniorxsound/Particle-Curl-Noise
- **pmndrs/react-three-fiber discussion #2400**：GPGPU curl noise 移植讨论（讨论帖，无独立许可）。URL: https://github.com/pmndrs/react-three-fiber/discussions/2400
- **pmndrs 系 GPU 粒子作品**（如 r3f-flow-field-particles 等）：参考流动场/噪点参数思路。

## 3. 噪声实现候选

- **Ashima arts / Stefan Gustavson simplex noise (GLSL)**：MIT。全行业标准 snoise(vec3)，直接内嵌（附出处注释）。
- **patriciogonzalezvivo/lygia (snoise)**：MIT。备选，未采用（Ashima 版更零依赖）。
- Curl noise 数值方法：Robert Bridson et al., Curl-Noise for Procedural Fluid Flow（SIGGRAPH 2007）+ Inigo Quilez 文章（https://iquilezles.org/articles/curl/），有限差分逼近 curl。

## 4. 分子可视化/结构方案候选

| 方案 | License | 结论 |
|---|---|---|
| 3Dmol.js | BSD-3 | 成熟 WebGL 分子查看器；自定义粒子层/动画管线深，集成改造成本高，仅借鉴 |
| NGL Viewer | MIT | 面向大分子（PDB），粒子层难以定制，未采用 |
| LiteMol | BSD | 同上 |
| GLmol (barionleg / biochem-fan) | MIT | 查看器，未采用 |
| RDKit.js (rdkit/rdkit-js) | BSD-3 | WebAssembly 版 RDKit 可算 3D 坐标；需 ~10MB wasm 与异步加载，单文件内嵌不划算；本项目 10 个固定分子用 PubChem 预生成即可 |
| morbvis（分子轨道查看器） | MIT | 视觉参考，未采用其代码 |
| compartia/hydrogen（氢原子轨道） | MIT | 粒子轨道可视化视觉参考 |
| PubChem REST 3D conformer | 公开数据（NIH） | **采用**：构建期下载 10 个分子 SDF，解析原子/键/坐标，正则化为苯环坐标系后内嵌 |

## 5. Bloom / 后期候选

- three.js examples 自带 UnrealBloomPass + OutputPass（r161 内）：**采用**，同版本分发避免依赖错配。
- pmndrs/postprocessing：MIT/Zlib；功能更全（Bloom/DOF/SMAA）但需再引一个 CDN 依赖且版本须与 three 对齐，未采用。

## 6. 技术栈（最终）

- 单文件 HTML（内嵌全部 JS/CSS/GLSL/数据），经 importmap 从 jsdelivr 加载 three@0.161.0 及 examples 插件（OrbitControls / EffectComposer / RenderPass / UnrealBloomPass / OutputPass）。
- WebGL2；THREE.Points（≤300k 粒子，单 draw call）+ ShaderMaterial；InstancedMesh 渲染分子。
- 化学引擎（诱导/共轭/官能团参数）全部在 JS 层，shader 只接收「场源数组」与 uniform —— 满足「chemistry 不写死在 shader」的架构要求。

## 7. 风险与缓解

- CDN 不可用：页面给出明确提示（不静默白屏）。
- 低端 GPU：四档画质 + 自适应降档（FPS 低于阈值自动降级 + toast）。
- Safari < 16.4 无 importmap：给出提示（macOS 用户通常已 ≥ 16.4）。
## 8. 电子密度着色（v2 设计）

- 实现：半定量电子势场 → 36³ 体素网格（对数压缩、固定标度归一化，以苯环核心≈1 为基准）→ 每个粒子的局部密度经三线性插值采样 → 256 级 1D LUT 查色（GPU 纹理）。
- 色图规范：默认 matplotlib Plasma（感知均匀，现代科学可视化标准）；可选 Inferno / Viridis / Cool-Warm（ChimeraX、PyMOL 静电势蓝↔红惯例）/ Cyan Glow（自研深蓝→青→白）。
- 设计要点：
NaN
NaN
NaN
NaN
NaN
## 9. 化学真实性审计（对照 Hammett σ 常数）

- 方法：把模型的场参数（诱导 I / 共振 R、共振交替因子、σ 键衰减）代入苯环六位，计算相对电子密度模式，与文献 σ_p / σ_m（Hansch-Leo 汇编）逐基团核对。
- 发现并修正 4 处偏差：
  (1) 间位共振因子 -0.35 → 0：原模型让 −M 基团（NO2/CN/CHO/COOH）间位显示富电子，与 σ_m 强正值矛盾；修正后间位转为「最轻贫化」（NO2 间位 0.81、邻/对 0.18–0.35），符合硝基苯邻/对强钝化、间位最轻的经典结论；
  (2) CH3 增加超共轭 (+H, R=+0.12)：σ_p=-0.17 的弱邻/对位给电子得以体现；
  (3) OH / OMe 共振强度互换（OH 0.85 > OMe 0.80）：对齐 σ_p(OH)=-0.37 < σ_p(OMe)=-0.27；
  (4) F/Cl 的 +M 调弱（0.20/0.10）并放缓 σ 键衰减（exp(-0.65·n)）：对位近中性（σ_p(F)=+0.06），间位贫化（σ_m +0.34/+0.37）。
- 修正后模型模式：+M 给电子基 → 邻/对富、间位中；−M 吸电子基 → 邻/对强贫、间位最轻；纯 −I 基（CF3/卤素）→ 从 ipso 到对位单调衰减；净分类（给/吸/弱）与 σ 判据一致。
- 运行时验证：11 个基团逐一代入，云质心偏移强度 NO2 > CN > OMe ≈ CH3 > NH2 ≈ F，与电子效应强度顺序相符；全程无报错。
## 10. 化学引擎 v3：σ 数据驱动（LFER 理论）

- **理论依据**：Hammett 方程（1937，log K = ρ·Σσ，多取代 σ 加和律）；Taft 双取代基参数（σ_I 诱导 / σ_R 共振分解）；Yukawa–Tsuno 方程（1959，σ⁺/σ⁻ 推-拉共振增强）；Brown–Okamoto σ⁺ 常数（1968）。均为线性自由能关系（LFER）经典领域，文献完备。
- **数据规模**：11 基团 ×（σ_m, σ_p, σ⁺, σ⁻, σ_I）≈ 55 个文献常数，全部公开；多取代由 σ 加和预测，无需逐物种数据。
- **模型公式**：
NaN
NaN
NaN
NaN
NaN
NaN
## 11. 创造模式（自由绘画碳架）

- 交互：六方网格吸附绘图板**只画碳架**——加碳（点空白）、连键（先选键级 单/双/三，再依次点两原子，已有键可升级键级；任一端键级和 > 4 自动回退并提示）、擦除；载入苯环模板 / 清空 / 应用。应用后点击 **3D 分子中的碳原子 → 取代 H 挂官能团**（规格同苯：弹层标题「C1–H · 替换 H」，同一碳可挂多个，受剩余价键限制）。
- **键级与芳香检测（修复环烷全变 sp² 的 bug）**：键级来自绘制（单 1/双 2/三 3，模板芳香 1.5），**环不再默认芳香**——全单键环 = 环烷（sp³，如环己烷）；交替单双的 4n+2 环（6/10/14…）按 Kekulé 画法自动芳香化（Hückel 规则，4n 环如环丁二烯不转化）；键长/键角按真实键级（1.54/1.34/1.20Å，sp³ 109.5°/sp² 120°/sp 180°）。
- 转换：2D 图 → 3D 分子（z=0 平面，六方格距 1.4Å）；隐式 H 按**键级和**补足四价（芳香环碳 1 个 H，链端碳 3 个 H，双键碳 1 个 H，炔碳 1 个 H / 内部炔 0 个 H）。
- **多官能团与价键校验（3D 取代 H）**：每挂一个基团即取代该碳一个 H（剩余可取代 H = 4 − Σ键级 − 已挂数），无可取代 H 时拦截并 toast 提示（如丙烷中间碳 2×Cl 后再挂第 3 个被拒）；官能团优先占「朝外」理想键位（远离分子质心，方向自然不重叠），H 填充其余空位；选择器显示符号/中文名/±I±M 三行 + 「可取代 H：N」，已挂基团绿色高亮，无可取代 H 时按钮置灰。
- **正常分子构型（力松弛嵌入 embedSkeleton）**：弹簧-角弹簧系统迭代求解——键长弹簧 K_B=40 以目标键长（芳香 1.39 / 双 1.34 / 三 1.20 / 单 1.54Å）收敛，键角弹簧 K_A=10 向 120°（sp²）/109.5°（sp³）/180°（sp）收敛；step=0.015 + 每步位移钳制 maxDisp=0.08 防止 Euler 发散（早期曾因角力 ÷sinθ 发散至 1e154，已修复；step 0.015 避免环闭合落入交替键长局域极小）；3000 次迭代 + sp³/sp 碳微小 z 扰动打破平面对称（否则环烷卡在平面 120° 局部极小；sp² 不加扰动保持平面）→ 环己烷实测键长全 1.54Å、椅式折叠，苯 1.39Å/120°/maxZ=0。**sp³ 理想方向显式构造正四面体**：d₀ 沿第一个邻居、d₁ 落在两邻居平面内且与 d₀ 成 109.47°（修复旧实现“最小旋转任意扭转”导致的环烷 C–C–H / H–C–H 角畸变，实测修复前最差 H–C–H 塌缩到 63°；修复后环己烷每个碳全部 6 个键角 = 109.47°）。官能团与 H 沿理想键方向（sp² 120° 平分空隙 / sp 直线）以 1.09Å 附着，成键方向由 v3quatFromTo 旋转保持基团本征扭转。
- **唯一拓扑识别（canonical SMILES）**：Morgan 不变量（加权、迭代、稳定化）→ 按不变量对原子分桶 → 对所有起点/对称性做字典序最小 SMILES（芳香碳记小写 c、芳香键隐式、联苯用 "-"、H 原子过滤不进入字符串；环闭合沿 BFS 生成树只走树边、闭合边由两端成对编号，避免伪二元环如 ccc1c1）→ 查预注册名称表（12 预设 + 运行时程序构建的烷烃/环烷烃/萘/联苯/二甲苯/乙苯）。识别结果显示分子式（如 C6H6）与中文名（苯 / 硝基苯 / 丁烷…）。
- **质心居中**：嵌入与 H/基团附着完成后，将全部原子坐标平移至质心为原点，分子恒在屏幕中心。
- 化学引擎泛化：σ 效应改由**碳骨架上 BFS 距离**传播——诱导沿全部 C–C 键按距离衰减；**共振只沿共轭网络传播**（π 键或连接两个 sp²/sp 碳的单键；ipso 碳为 sp³ 时该取代基无共振项，如氯乙烷只有 −I、氯苯才有 +M/−M 交替）——苯环上与原 ringSteps 结果逐位相同，预设验证保持 15/15；任意链/环/多环骨架同样适用。
- 与既有管线全兼容：3D 渲染、电子云过渡、σ 骨架路径流动（BFS 通用）、密度悬停、模式切换、Explain 箭头、推-拉增强（增删逻辑经 3D 弹层统一入口）。
- **粒子严格贴 σ 骨架流动**：所有跨原子迁移一律沿 BFS 键路径流经**原子序列**（折点恰在原子处，骨架弯折处不切角；含杂原子），取消原 1.0Å 内直飞捷径；路径路点 6→9（8 段，属性 16→15：延迟打包进 aSeed.w）；过渡期间路径粒子噪声/横向 curl 衰减至 55%（带状弥散），过渡后恢复活气。
- **过渡性能（换官能团不再卡顿）**：同格匹配大格改「3D 交织键排序按秩配对」O(n log n)（原 O(n²) 全扫描，160k 粒子 354–751ms → 95–121ms）；最近原子查询改固定 10³ 整数格哈希、原子对路径全缓存；匹配与路径构建整体**分帧异步**（_yieldChunks，每片 ~15ms 让出主线程），主线程不再冻结（原单次 ~800ms 阻塞 → 每帧 ≤15ms），过渡就绪后启动，代际号防止快速连点串扰。原子拾取采用**屏幕投影圆判定**（不依赖网格实例/动画缩放，慢 GPU 下生长中的原子也稳定可点）；弹层层级高于创造面板，左侧原子弹层不被遮挡。
- 已知简化：不处理立体/构象（环烷折叠为近椅式但非精确椅/船）；多环并环交替为近似；芳香化仅识别「交替单双 4n+2 环」一种画法。
- 验证（headless，geo-test.js + groups-test.js）：画布仅含 加碳/连键/擦除 三工具、无内嵌基团面板 ✓；苯——avgBond 1.39Å、avgAngle 120°、质心 [0,0,0]、maxZ=0、识别 苯 C6H6 ✓；丁烷——avgBond 1.51Å、识别 丁烷 C4H10 ✓；3D 弹层（标题「C1–H · 替换 H」）挂 NO₂——识别 硝基苯 C6H5NO2 ✓；丙烷中间碳经 3D 取代 H 挂 2×Cl——C3H6Cl2、H 计数正确、第 3 个 Cl 被拦截（toast）✓；苯+2×Cl（邻位）——C6H4Cl2、SMILES 环闭合成对合法 ✓。

## 12. 创造模式：碳架本征密度基线 + 碳均归一（半定量，文献数据）

- **需求**：创造模式下电子密度以**所有碳的平均密度 = 1** 显示；且初始碳架（无取代基）密度即不均匀（体现碳架原子间的本征相互作用）。
- **杂化因子 R（s 成分 → 电负性 → 碳电子密度）**：轨道电负性随 s 成分增大（Bent's rule：sp > sp² > sp³）。数据：Hinze & Jaffé（1962）轨道电负性（Mulliken, eV）：C(sp3)=7.98、C(sp2)=8.79、C(sp)=10.39 → 相对 1.000 : 1.101 : 1.302。高电负性碳吸引/持有更多 σ 电子密度。
- **C–H 极化项**：Pauling 电负性 C(2.55) > H(2.20)，每个 C–H 键把电子密度向碳偏移 → 烷烃中 CH₃ 富 > CH₂ > CH > C（季碳最贫）。幅度 CH_POLAR=+0.07/键为**校准常数**（量级锚定文献典型烷烃碳部分电荷差异，ESP/Mulliken 分析 propane 的 CH₃ 明显负于 CH₂，约几 %）。
- **合成**：碳 i 的本征基线 = R(杂化) × (1 + 0.07 × 该碳 C–H 键数)；创造模式的场因子 = σ 因子 × 本征基线；悬停显示 rel = 因子 / 全部碳均值（碳均=1.00）。取代基 σ 效应在基线上叠加；挂基团使 ipso 碳失去一个 C–H → 基线自动降低。
- **化学验证模式**：丙烷 CH₃(1.03) > CH₂(0.97)（碳均=1.00）✓；异丁烷季碳最贫(0.86) ✓；苯六位严格相等（初始态均匀，符合事实）✓；萘并环无 H 碳(0.96) < 带 H 碳(1.03) ✓；环己烷均匀 ✓；硝基苯 ipso<邻<对<间（相对贫化顺序正确，因碳均归一而围绕 1 分布）✓。
- **预置分子不变**：仍为「苯环=1.00」规范，不受基线影响；validate-sigma 15/15 保持。