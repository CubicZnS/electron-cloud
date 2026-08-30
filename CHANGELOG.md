本项目采用语义化版本（SemVer）：主版本号 = 功能里程碑，次版本号 = 兼容性新功能，补丁号 = 修复。

## [v2.2.0] — 2026-08-31 · 前线轨道可视化（双色相位粒子云）

### 新增功能
- **轨道模式**：导入带符号字段（HOMO/LUMO 等分子轨道）不再拒绝，自动路由到轨道模式——粒子按 |ψ| 分布、颜色按相位 sign(ψ) 分正/负双色（正=暖色紫红→橙→黄，负=冷色深蓝→蓝→青，VMD/Jmol 惯例），节点面 ψ=0 处无粒子 → 天然呈现节面空隙
- **数据层**（parts/03b_cube.js）：parseCubeText 支持 allowSigned（保留原始带符号值）；buildCubeVolume 支持 mode:orbital（|ψ| 幅值截断 max(95% 质量, 1e-4×峰值) + |ψ| 对数加权采样）；sampleCloudCube 输出 sign 数组
- **着色器**（parts/04_glsl.js）：vSign varying（存于 aProps.w，随过渡平滑交叉渐变——相位扫过 0 时颜色翻转）+ 双 LUT uniform（uDensityTex/uDensityTexNeg）+ uOrbitalSign 分支；密度/半定量模式不受影响（sign 恒 0、单 LUT）
- **渲染**（parts/05_render.js）：setOrbitalRender(on) 切换固定正/负相位 LUT；props.w 写入 sign（过渡 + 粒子数变更均携带）
- **UI**（parts/06b_cube_ui.js）：字段统计路由（>20% 负值或注释行轨道 → 轨道模式）；面板「轨道标注」选择器（HOMO/LUMO/其他，仅图例文字——不假装自动推断）；轨道图例含正/负相位双色条与节点说明；轨道模式色图选择器停用

### 诚实边界
- 不自动推断 HOMO vs LUMO：Multiwfn 文件无标签，由用户手动标注（仅影响图例文字）；Gaussian 注释行若含轨道序号会显示
- 轨道/ESP 等带符号字段统一按「双色相位」渲染（|ψ| 分布 + sign 配色）；|ψ|² 型（非负轨道密度）自动按密度模式渲染

### 验证
- node tools/validate-cube.mjs：53/53（新增 7 项轨道测试：默认拒绝→allowSigned 保留、|ψ| 截断、相位双色采样、密度模式 sign 恒 0）
- node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK
- 真实文件 ASPIRIN_HOMO47.cub（Multiwfn HOMO 轨道）：解析 129ms，|ψ|max≈0.315，相位 52%/48% 平衡，粒子全有限

### 文件
- 修改：parts/03b_cube.js、parts/04_glsl.js、parts/05_render.js、parts/06b_cube_ui.js、parts/01_head.html、parts/03_core.js、tools/validate-cube.mjs、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.1.0] — 2026-08-31 · 字段类型自动检测（诚实启发式）
  - 注释行明确（Gaussian 写 Density / Orbital N / ESP / ELF / Laplacian）→ 高置信标注
  - 数据统计：负值体素 >20% → 带符号标量场（分子轨道或 ESP，高置信，不假装区分二者）；非负 + 高峰值 → 可能为电子密度（中置信）；非负 + 0–1 有界 → 非负标量场（低置信，可能 ELF）；少量负值 → 密度差/噪声（低置信）
- **面板元数据显示「字段类型」行**：如「带符号标量场（分子轨道或 ESP，非电子密度）（置信：高）」
- 带符号字段拒绝（SIGNED_FIELD）的错误消息按检测结果给出具体提示（如「注释行标注为分子轨道」）

### 设计说明（诚实边界）
- 不假装识别 HOMO vs LUMO、轨道 vs ESP：真实带符号文件振幅不可靠（实测 ASPIRIN_HOMO47.cub |值|max ≈ 5.3e5），只用「带符号字段」高置信大类
- DFT 字样（Density Functional Theory）不会误判为 density 提示

### 验证
- node tools/validate-cube.mjs：47/47（新增 6 项字段类型估计测试，含真实文件统计特征回归）
- node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、parts/06b_cube_ui.js、tools/validate-cube.mjs、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.0.1] — 2026-08-31 · 修复：导入带符号字段（HOMO/LUMO 轨道、ESP）导致云弥散
### 修复
- **带符号字段拒绝**（parts/03b_cube.js）：电子密度处处非负；若负值体素占比 > 20%，判定为 HOMO/LUMO 轨道、静电势 ESP 等带符号标量场并拒绝（SIGNED_FIELD），提示在 Multiwfn 中导出 electron density 后再导入。
  - 背景：真实案例 ASPIRIN_HOMO47.cub（Multiwfn 导出的阿司匹林 HOMO 轨道，42.1% 体素为负）——旧实现把负值截断为 0 后，正值布满全盒 → 云弥散；现已改为友好错误且不改变当前场景。
- 数值噪声级负值（<20%，如 -1e-9）正常放行。

### 验证
- node tools/validate-cube.mjs：41/41（新增带符号字段拒绝、数值噪声负值放行两项测试）
- node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、tools/validate-cube.mjs、index.html（组装产物）

---

## [v2.0.0] — 2026-08-31 · Quantum Data：真实电子密度 Cube 导入

### 新增功能
- **Quantum Data 导入入口**：底部工具区新增独立圆形入口（紫色原子图标，Lucide Atom，ISC），与创造模式并列；打开与现有深色玻璃面板一致的导入面板（拖放 / 选择文件，仅接受 `.cube` / `.cub`，本地浏览器解析，不上传、不落盘）
- **Gaussian Cube 解析器**（`parts/03b_cube.js`，纯 JS 无 THREE/DOM 依赖，Node 可直接校验）：
  - 读取两行注释、原子数/原点、三个网格轴、原子列表、体素标量值；任意空白/科学计数法/任意换行/CRLF
  - 原子单位（bohr）→ Å（×0.529177210903，CODATA 2018），统一按网格中心居中
  - 完整三轴仿射变换（不假设正方体、不以原点为中心），三线性插值采样
  - 集中配置限制：文件 ≤ 64 MB、体素 ≤ 4,000,000（面板明示）
  - 明确拒绝：负原子数/DSET_ID、多数据集/多轨道合并（提示在 Multiwfn 单独导出）、非法头部、NaN/Infinity、整体非正密度、体素数不匹配、超限；兼容 Multiwfn「数据集计数 1」前缀
- **真实密度驱动粒子云**：`CubeVolume`（原子/原点/三轴/尺寸/体素/采样/统计）→ 对数密度加权采样（核心与价层均可见）→ 复用现有粒子过渡、颜色 LUT、Bloom、画质切换
- **低密度截断双保险**：`cutoff = max(95% 总质量阈值, 0.1% × 峰值)` —— 松包围盒/非零背景不再弥散（回归测试覆盖）
- **导入模式 UI**：状态机 idle → reading → validating → ready → applying → applied / error；元数据显示文件名/原子数/网格/Voxel/空间范围/单位；图例标注 `Imported electron density` + 文件名 + 数据源
- **数据源隔离**：导入模式下 Total/Inductive/Resonance、官能团替换、Explain 禁用并说明原因；点分子芯片/创造模式/图例链接均可一键退出回半定量模式（恢复原分子与模式）
- **安全回退**：元素表未覆盖的原子中性显示（`elementInfo`），视觉单键按共价半径推断（不声称是 QM 键级），未知元素不崩溃

### 修复
- 导入面板错误状态框不显示错误文本（错误消息只出现在状态行）→ 已写入错误框
- 电子云弥散：纯 95% 质量截断在背景质量 ≥ 5% 时跌破背景、保留整盒噪声 → 增加 0.1%×峰值下限；颜色缩放从 `log1p(ρ)/log1p(ρmax)` 改为以截断阈值为 0 的对数重映射（包络可见），采样权重改为对数密度加权

### 验证
- `node tools/validate-cube.mjs`：39/39（最小有效 Cube / 非零原点 / 科学计数法 / 非法体素数 / 多数据集拒绝 / 单位与数组尺寸 / 端到端苯密度场 / 松盒不弥散回归）
- `node tools/validate-sigma.mjs`：15/15（半定量 σ 模型回归，不受影响）
- `node tools/build.mjs`：SYNTAX_OK（10 分片组装）

### 文件
- 新增：`parts/03b_cube.js`（Cube 解析/采样）、`parts/06b_cube_ui.js`（导入面板）、`tools/validate-cube.mjs`（Node 校验）
- 修改：`parts/01_head.html`、`parts/03_core.js`、`parts/05_render.js`、`parts/06_ui.js`、`parts/07_main.js`、`tools/build.mjs`、`index.html`（组装产物）、`docs/REFERENCES.md`（Resource 26–30）、`README.md`

---

## [v1.0.0] — 2026-08-30 · Electron Cloud 半定量电子效应可视化（基线）

- GPU 粒子电子云（THREE.Points + ShaderMaterial + UnrealBloomPass，4000–300000 粒子平滑流动，分帧异步计算）
- 化学引擎：Hammett σ / Taft σ_I·σ_R / Yukawa–Tsuno σ⁺·σ⁻ 推-拉增强，密度因子 = exp(−K·Σσ)
- 电子密度着色：36³ 体素网格 + 对数压缩，Plasma/Inferno/Viridis/Cool-Warm/Cyan Glow 色图
- σ 骨架电子流（跨原子沿键路径流动）、官能团取代（11 基团）、创造模式（六方碳架 + Hückel 芳香化 + canonical SMILES 识别 + 力松弛嵌入）、碳架本征密度基线（Hinze–Jaffé + Pauling）
- 移动端适配（响应式布局/触摸/默认低档）、崩溃自愈（LITE 档）、Safari 极简档（#ifdef SIMPLE）、three.js 多 CDN 回退
- 验证：`tools/validate-sigma.mjs` 15/15

> 基线功能详细说明见 `README.md` 与 `docs/RESEARCH.md`；全部复用资源与许可证见 `docs/REFERENCES.md`。
