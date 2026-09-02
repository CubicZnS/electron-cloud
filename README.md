# Electron Cloud · 有机化合物电子效应可视化

GPU 粒子电子云交互可视化：分子 · 电子云 · 诱导效应 / 共轭效应 · 自由碳架创造模式 · Quantum Data 电子密度 Cube 导入。
半定量教学演示（非量子化学计算），密度着色、官能团取代、σ 骨架电子流全部实时；也可导入 Gaussian cubegen / Multiwfn 导出的真实电子密度 Cube（.cube/.cub）驱动粒子云（本地解析，不上传）。

> by CubicZnS · 单文件 HTML 产物，无构建依赖（three.js 由 CDN 加载）
>
> **当前版本：v2.5.15（新增等值面拟合精度滑块——多边形细分）** · 版本历史见 [CHANGELOG.md](CHANGELOG.md)

## 功能

- **GPU 粒子电子云**（THREE.Points + ShaderMaterial，UnrealBloomPass 辉光）：粒子的位置/尺寸/亮度/密度全部在顶点着色器内插值，分子变化时 4000–300000 粒子平滑流动（分帧异步计算，主线程不冻结）
- **化学引擎（σ 数据驱动 / LFER）**：Hammett σ 加和、Taft σ_I/σ_R 分解、Yukawa–Tsuno σ⁺/σ⁻ 推-拉增强；密度因子 = exp(−K·Σσ)，多取代加和
- **电子密度着色**：36³ 体素网格 + 对数压缩，matplotlib 科学色图（Plasma/Inferno/Viridis）+ 静电势 Cool-Warm + Cyan Glow；悬停碳原子显示相对密度（预置分子：苯环=1.00；创造模式：碳均=1.00）
- **σ 骨架电子流**：分子变化时粒子严格沿 C–C 键路径（途经原子）流动，骨架弯折处不切角；含杂原子路径
- **官能团取代**：11 种常见基团（CH₃/OH/OMe/NH₂/F/Cl/CF₃/CN/NO₂/CHO/COOH），点击原子/取代 H 挂载，多取代按剩余价键限制，价键超 4 自动拦截
- **创造模式（自由碳架）**：六方网格绘制碳架，支持单/双/三键；交替单双 4n+2 环按 Hückel 规则自动芳香化（环烷保持 sp³）；力松弛嵌入给出标准键长/键角（sp³ 109.47° 正四面体、sp² 120°、sp 180°）；canonical SMILES 唯一拓扑识别（苯/硝基苯/烷烃/烯/炔…）
- **碳架本征密度基线**：杂化轨道电负性（Hinze–Jaffé）+ C–H 极化（Pauling），初始碳架密度即不均匀（CH₃ 富 > CH₂ > CH > 季碳；芳香 > 烷基）
- **前线轨道可视化**：导入 HOMO/LUMO 等带符号轨道 Cube 自动进入轨道模式——粒子按 |ψ| 分布、正相位暖色 / 负相位冷色双 LUT、节点面 ψ=0 处呈空隙；轨道标注（HOMO/LUMO/其他）由用户指定，不假装自动推断
- **Quantum Data（电子密度 Cube 导入）**：底部 Quantum Data 入口导入 Gaussian cubegen / Multiwfn 导出的单标量场电子密度 `.cube/.cub`（64 MB / 400 万体素上限，本地解析不上传）；bohr→Å 换算并按网格中心居中；粒子按真实密度权重采样（对数密度加权；低密度截断 = max(95% 总质量阈值, 0.1%×峰值) 双保险，松包围盒/非零背景也不会弥散）；复用现有粒子过渡 / 色图 LUT / Bloom / 画质切换；图例标注 `Imported electron density`；导入模式下 Total/Inductive/Resonance 与官能团替换禁用并说明原因，可一键退出回半定量模式
- Explain 模式 / 诱导-共轭分解模式 / 性能自适应降级 / 悬停密度标签

## Quantum Data 支持文件清单（v2.5.9）

> 本文档与代码同步维护：parts/03b_cube.js（解析/采样）、parts/06b_cube_ui.js（面板路由）改动后请同步更新下表。

### 文件格式

| 项目 | 支持情况 |
|---|---|
| 扩展名 | .cube / .cub（Gaussian Cube 格式） |
| 来源 | Gaussian cubegen / Multiwfn / Psi4 / CPMD / CP2K / NWChem / PWScf / cclib 等一切按 Cube 规范输出的程序 |
| 处理方式 | 本地解析，不上传（内存读取） |
| 大小上限 | ≤ 64 MB |
| 体素上限 | ≤ 4,000,000（约 159³ 网格） |

### 字段类型自动识别与导入行为

| 字段类型 | 判定依据 | 导入模式 | 元数据标注 |
|---|---|---|---|
| 电子密度 | 注释含 density（排除 functional/theory/potential 上下文）；或非负+大振幅 | 密度模式（单色 Plasma，颜色按密度分位展开） | 电子密度（置信高/中） |
| 分子轨道 | 注释含 orbital/homo/lumo/wave function；或负值 >20% | 带符号双色相位（正/负） | 分子轨道（非电子密度） |
| Hartree 势 | 注释含 hartree | 带符号双色相位 | Hartree 势（非电子密度） |
| ESP 静电势 | 注释含 esp/electrostatic potential/mep | 带符号双色相位 | 静电势 ESP（非电子密度） |
| ELF / Laplacian | 注释含对应关键词 | 带符号双色相位 | ELF / Laplacian（非电子密度） |
| 自旋密度 | 负值约 50% | 双色显示正/负自旋区 | 带符号字段 |
| 非负/未知场 | 无关键词启发式 | 密度或双色（按负值占比路由） | 低置信诚实标注 |

> 势场类（orbital/hartree/esp/laplacian/elf/signed_field）一律按带符号双色相位路由，避免长程势场按密度截断弥散。

### 数据布局 / 坐标处理

| 能力 | 说明 |
|---|---|
| 非零原点 + 三轴仿射 | 任意 origin、非正方体网格、完整 3x3 逆变换（Cramer） |
| 数据序自动检测 | 6 种布局（xyz..zyx）按原子处密度均值择优；非 x-fastest 自动重排 |
| 单位自适应 | 原子坐标最近邻中位数 <1.5 → 判定 Å（÷0.529 统一到 bohr 再检测）——修复 CPMD 伪原子文件（坐标 Å / 网格 bohr）布局检测失效 |
| 网格中心居中 | 分子与网格统一居中显示 |
| CPMD 伪原子检测 | 原子序数 = 1..N 连续标签 + 部分电荷 → 元素几何推断（C/H/N/O/S），坐标按 Å 读（骨架尺寸正确） |
| 元素视觉表 | 30 种元素（H/C/N/O/F/Cl + B/Si/P/S/Br/I + 碱金属/碱土 + 常见过渡金属），CPK 配色 |

### 会拒绝的文件（明确中文报错）

| 错误 | 条件 |
|---|---|
| EMPTY | 空文件 / 无法读取 |
| BAD_HEADER / BAD_DIMS / BAD_ATOMS | 头部 / 网格轴 / 原子行格式或数值无效 |
| TOO_MANY_VOXELS | 体素 > 400 万 |
| MULTI_DATASET | 负原子数 / 数据集计数 ≥2（Multiwfn 多轨道合并） |
| NON_FINITE | 体素含 NaN / Infinity |
| DATA_COUNT | 体素数量与网格不符 |
| NON_POSITIVE | 整体非正值（无有效密度） |
| SIGNED_FIELD | 默认密度模式遇 >20% 负值（引导重新导出 electron density） |
| DEGENERATE_AXES | 网格轴线性相关 |
| 文件超 64MB | UI 层直接拒绝 |

### 样例库（sample-cubes/，27 个文件全部验证）

- **electron_density/（11）**：苯、乙醇、CO、NH₃、水、h-BN、Mn₂GeO₄ 自旋密度、913 原子蛋白-配体（CPMD）、Psi4 水密度、Curcumin_3OH、α-环糊精
- **orbital/（11）**：咖啡因 HOMO/LUMO/MO46/MO56、C9H3Cl3O3、CO LUMO、水 ESP×2、苯 Hartree 势、Curcumin_3OH HOMO/LUMO
- **unsupported/（5）**：负网格数 CPMD（913/4667 原子）、负原子数苯 HOMO、vspin 4 数据集、Cd MO48 双分量（格式变体参考）
- 新增样例均比咖啡因（24 原子）复杂且不超过环糊精级别；详细规格、来源与许可证见 sample-cubes/README.md 和 docs/REFERENCES.md Resources 32–41；数据文件不入 git

## 快速开始

任意静态服务器打开 `index.html` 即可（需网络加载 three.js）：

```bash
python3 -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080/index.html
```

- three.js 0.161.0 由 jsdelivr CDN 提供（`importmap` 已内嵌）
- 在 DSH 工作台内运行时使用工作台原生皮肤；独立打开时自动注入等价的极简按钮皮肤（`dshell-btn` 兜底）

## 目录结构

| 路径 | 说明 |
|---|---|
| `index.html` | **单文件产物**（自包含：样式/着色器/数据/逻辑全部内嵌） |
| `parts/` | 源码分片（01_head → 08_tail；新增 03b_cube.js 纯 Cube 解析/采样模块、06b_cube_ui.js 导入面板），`tools/build.mjs` 组装 |
| `tools/` | 构建（build.mjs）、数据生成（gen-molecules.mjs）、σ 校验（validate-sigma.mjs，15/15 通过）、Cube 校验（validate-cube.mjs，65/65 通过） |
| `docs/RESEARCH.md` | 技术方案与模型推导（化学引擎/密度/构型/性能） |
| `docs/REFERENCES.md` | 全部复用资源与许可证清单（务必随项目分发） |

## 模型与数据来源（半定量，非编造）

- Hammett 方程 / Jaffé 汇编 σ 常数；Taft 双参数（σ_I / σ_R）；Yukawa–Tsuno、Brown–Okamoto σ⁺/σ⁻
- Hinze & Jaffé (1962) 杂化轨道电负性（sp³ 7.98 / sp² 8.79 / sp 10.39 eV）；Pauling 电负性（C 2.55 / H 2.20）
- Hückel 4n+2 芳香性；Bent's rule（s 成分 ↑ 电负性 ↑）
- PubChem 3D 构象数据（11 个碎片几何）
- 详细来源见 `docs/REFERENCES.md`（Resource 1–25）

## 许可证

本项目代码采用 **MIT License**。内嵌/复用的第三方资源许可如下（完整清单见 `docs/REFERENCES.md`）：

- three.js（MIT）· Ashima Arts / Gustavson simplex noise（MIT，shader 内保留署名）
- Lucide 图标（ISC）· matplotlib 色图（BSD）· PubChem 数据（公共领域）
- 文献常数（Hammett/Taft/Hinze–Jaffé/Pauling/Hückel 等）为公开科学数据
