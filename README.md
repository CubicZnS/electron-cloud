# Electron Cloud · 有机化合物电子效应可视化

GPU 粒子电子云交互可视化：分子 · 电子云 · 诱导效应 / 共轭效应 · 自由碳架创造模式 · Quantum Data 电子密度 Cube 导入。
半定量教学演示（非量子化学计算），密度着色、官能团取代、σ 骨架电子流全部实时；也可导入 Gaussian cubegen / Multiwfn 导出的真实电子密度 Cube（.cube/.cub）驱动粒子云（本地解析，不上传）。

独立的 **Crystal Lab 晶体实验室**支持周期晶格、掺杂与空位编辑，通过可选的本地 ASE / MACE-MPA-0 引擎计算结构弛豫，比较原子位移、能量、力与晶胞变化。

> by CubicZnS · 单文件 HTML 产物，无构建依赖（three.js 由 CDN 加载）
>
> **当前版本：v2.6.0（全屏晶体实验室与本地结构弛豫）** · 版本历史见 [CHANGELOG.md](CHANGELOG.md)

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

## Crystal Lab 晶体实验室（v2.6.0）

底部第三个入口打开独立全屏工作区；退出后恢复原电子云场景。

- **晶体模板（未发布）**：232 个常见晶体起始结构、23 类晶型，覆盖单质（FCC/BCC/HCP、金刚石 A4、石墨 A9）、二元（岩盐 B1、CsCl B2、闪锌矿 B3、纤锌矿 B4、萤石/反萤石、金红石 C4、NiAs、h-BN、2H-MoS₂、黄铁矿 C2、赤铜矿 C3、CdI₂ 2H、刚玉 D5₁）与三元（钙钛矿 E2₁、尖晶石 H1₁、方解石、锆石）；含 NaCl、Cu、Fe、金刚石 C、GaAs、ZnO、CaF₂、TiO₂、SrTiO₃、MgAl₂O₄、ZrSiO₄ 等。按晶型分组，一键载入单晶胞，可继续调整元素、a、c/a、内部坐标及超胞。参数为近似起始值，非实验数据库；[完整清单、来源与参数约定](docs/CRYSTAL_TEMPLATES.md)。
- **晶格与位点**：保留 B2、BCC、FCC、HCP 自由搭建，并扩展上述晶型；元素（二元 A/B，三元 A/B/C）、晶格常数、非立方 c/a、内部坐标和超胞尺寸可调，最多 512 个独立原子。支持选中替换、按位点（A/B/C/全部）随机掺杂（保留种子）及空位。
- **边界补全**：完整显示周期镜像。最小 FCC 常规晶胞显示 14 个球，按 8 × 1/8 + 6 × 1/2 折为 4 个原子；棱上按 1/4。点击镜像选择对应独立位点，计算、成分比例及导出不重复计数。非周期方向不补镜像、不分摊。
- **恢复初始结构**：晶格常数旁的“生成”和“生成晶体”均按当前搭建参数重新生成，清除掺杂、空位和弛豫结果；这不会预测平衡晶格常数。
- **真实弛豫**：可选本地 MACE-MPA-0 模型，0 K 原子位置优化或原子位置 + 晶胞零外压优化。离线时仍可搭建和编辑；真实计算与 CIF/POSCAR/XYZ 解析需启动引擎。
- **比较**：弛豫能量变化、内部位移 RMS、最大原子力、体积变化、近邻间距、初始轮廓与位移箭头。显示倍率只影响画面；插值不代表动力学轨迹。能量差是同成分结构的弛豫能，不能直接当作缺陷形成能或占位偏好。
- **交换与追溯**：导入 CIF、POSCAR/VASP、XYZ/extended XYZ（文件 ≤ 2 MiB）；导入/导出项目 JSON（schemaVersion 1，导入 ≤ 64 MiB），记录结构、编辑历史、计算设置、结果、模型参数 SHA-256 和计算帧；可导出 extended XYZ。无序/部分占据 CIF 会拒绝，避免静默选择元素。

MACE 的元素覆盖不代表任意合金都已验证准确。科研使用需针对具体体系与 DFT/实验比较；本模块不生成电子密度，真实电子场仍由 DFT 等软件导出 Cube 后在 Quantum Data 中查看。初始 a = 2.88 Å 只是 B2 NiAl 的可编辑起点，切换元素不会自动估算新常数。

引擎安装、启动和 API 见 [crystal-engine/README.md](crystal-engine/README.md)。结构坐标为 Å，能量 eV，力 eV/Å，应力 GPa；Python 环境与模型权重放在仓库外。

已知验证限制：本机浏览器能触发 JSON/XYZ 保存请求，但 macOS 保存面板曾持续禁用“保存”，尚未完成浏览器导出落盘验证；真实结果 JSON 的导入恢复及序列化校验已通过。界面只提示“已请求保存”，不宣称文件已保存。

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

开发修改 `parts/` 后重新组装并验证：

```bash
node tools/build.mjs
node tools/validate-sigma.mjs
node tools/validate-cube.mjs
node tools/validate-crystal.mjs
```

前端无安装/打包依赖；组装需要 Node.js。本地计算需另行安装 Python 依赖，详见引擎说明。

## 目录结构

| 路径 | 说明 |
|---|---|
| `index.html` | **单文件产物**（自包含：样式/着色器/数据/逻辑全部内嵌） |
| `parts/` | 源码分片（01_head → 08_tail；新增 03b_cube.js 纯 Cube 解析/采样模块、06b_cube_ui.js 导入面板），`tools/build.mjs` 组装 |
| `parts/03c_crystal.js` | 晶体几何、周期边界、镜像折算与结果校验 |
| `parts/05c_crystal_render.js` / `parts/06c_crystal_ui.js` | 独立晶体场景、全屏交互与本地引擎请求 |
| `crystal-engine/` | ASE / MACE 本地服务、固定版本依赖、测试与运行说明 |
| `tools/` | 构建（build.mjs）、数据生成（gen-molecules.mjs）、σ 校验（validate-sigma.mjs，15/15 通过）、Cube 校验（validate-cube.mjs，73/73 通过） |
| `tools/validate-crystal.mjs` | 晶体校验（17/17），含边界权重、非正交晶胞与结果追溯 |
| `AGENTS.md` / `MEMORY.md` | 协作规范与长期架构决策 |
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
- 可选计算依赖：MACE 代码与 MACE-MPA-0 权重（MIT）、ASE（LGPL-2.1-or-later）、PyTorch（BSD-3-Clause）；均通过外部环境安装，未打包进 HTML。详见 `docs/REFERENCES.md` Resource 42–44。
