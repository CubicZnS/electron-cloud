本项目采用语义化版本（SemVer）：主版本号 = 功能里程碑，次版本号 = 兼容性新功能，补丁号 = 修复。

## [v2.5.5] — 2026-08-31 · 修复：电子密度模式无颜色变化（颜色按密度分位展开）

### 修复
- **根因**：v2.5.1 的平均居中对数映射把大多数粒子的颜色属性压在 0.4–0.6 窄带（实测苯 96% 粒子在此区间，标准差仅 0.05）→ 电子密度模式云呈单色、看不到密度梯度。
- **修复**（parts/03b_cube.js）：颜色改为**加权密度分位展开（直方图均衡）**——buildCubeVolume 按粒子权重累计密度的对数分位 CDF（rhoCDF），sampleCloudCube 用 dAttr = rhoCDF(log1p(ρ))（0..1 单调）映射；任何密度分布下颜色都铺满整条色图（低密度冷/暗 → 高密度暖/亮）。轨道模式同按 |ψ| 分位（相位双色不变）。
- 图例文案同步更新（改为「颜色按密度分位展开」）。

### 实测
| 文件 | 修复前 σ | 修复后 σ | 修复后分布（10 段） |
|---|---|---|---|
| 苯 | 0.052 | 0.289 | 均匀（每段 ~4000/40000） |
| 乙醇/水/CO/NH3 | 0.04–0.07 | 0.29 | 均匀 |
| 萘/环糊精 | 0.04–0.11 | 0.31 | 均匀 |

### 验证
- node tools/validate-cube.mjs：59/59（颜色比例 O>C>H 保持单调）；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、parts/06b_cube_ui.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.4] — 2026-08-31 · 修复：面板打开后图例消失 / 长文件名溢出
- **图例不再随面板隐藏**：移除 v2.5.3 的「面板打开时隐藏图例」逻辑；改为将 Quantum Data / 创造面板的高度上限收紧为 calc(100dvh - 300px)（面板底部停在左下角图例区上方）→ 图例始终可见且不与面板重叠。
- **长文件名省略号**：面板元数据「文件」行、状态文本、图例文件名均改为单行省略号（text-overflow:ellipsis），悬停显示完整文件名（title）；避免超长文件名撑爆/溢出布局。

### 验证
- node tools/validate-cube.mjs：59/59；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/01_head.html、parts/06b_cube_ui.js、parts/06_ui.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.3] — 2026-08-31 · UI 统一与防重叠：Quantum Data 面板高度、图例遮挡、文字层级
- **Quantum Data 面板高度/重叠**：面板从垂直居中改为顶对齐（top:76px），max-height 为底部工具区留 ≥82px —— 打开面板不再与下方分子栏/按钮/图例重叠；移动端 top:112px 避开折叠顶栏。
- **图例遮挡**：左侧面板（Quantum Data / 创造模式）打开时自动隐藏左下角图例，关闭后恢复（避免面板盖住图例）。
- **整体一致性**：创造面板、信息卡同步顶对齐 + 高度上限（infoCard 不再与调试面板重叠）；辅助提示文字统一规格（9px/faint/字距.5/行高1.7，覆盖 .qd-hint/.cr-hint/.densityhint）；Quantum 面板宽度 376px 与创造面板 378px 视觉一致。
- **设计规格文档化**：parts/01_head.html 内置统一设计规格注释；docs/REFERENCES.md 新增 Resource 31（规范归纳自既有开源素材：dshell 皮肤 / Lucide / matplotlib·ChimeraX 色规范）。

### 验证
- node tools/validate-cube.mjs：59/59；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/01_head.html、parts/06b_cube_ui.js、parts/06_ui.js、docs/REFERENCES.md、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.2] — 2026-08-31 · 修复：导入后电子云停留在旧状态（HOMO 全黄 / 密度仍为旧苯云）
- **根因**：applyCubeVolume 的导入过渡走 transitionCloudFromData 的**异步分帧粒子匹配**（requestAnimationFrame 分帧执行）；在部分浏览器环境下匹配回调不完成（uTransStart 保持 -999、props/sign 不写入）→ 云停留在旧苯云状态：HOMO 用旧 props（w=0）→ 全部走正相位 LUT（全黄），密度仍是旧苯云。
- **修复**（parts/05_render.js applyCubeSampleDirect）：导入模式改为**同步直接写入采样云 + 线性过渡**——旧位置快照 → 新位置/属性/相位立即写入，uTransStart/uTransDur 同步设置，随机延迟柔和波浪过渡；完全不依赖异步分帧匹配，导入后立即呈现正确云与相位双色。

### 验证（headless 实测）
- Apply 后 1.2s：uTrans=0.31/2.6（过渡运行）、aProps.w 含 ±1、orbSign=1、云位置更新（max r 5.0Å）
- 渲染像素：暖(正相位) 2637 / 冷(负相位) 3102 → 红蓝双瓣可见 ✓
- node tools/validate-cube.mjs：59/59；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/05_render.js、parts/06b_cube_ui.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.1] — 2026-08-31 · 颜色归一化：以分子平均电子密度 = 1（修复大分子通体发紫）
- **根因**：原颜色映射以「截断→0.12、峰值→1」为基准；大分子（环糊精 ρmean ≈ 12.6% ρmax）的绝大多数粒子落在色图暗紫端 → 通体发紫。
- **修复**（parts/03b_cube.js）：buildCubeVolume 计算 kept 体素的平均电子密度 ρmean；sampleCloudCube 改为**平均居中映射** dAttr = 0.5 + 0.5·(log1p(ρ) − log1p(ρmean))/half（half 取峰值/均值 与 均值/截断 的较大者，对数半程对称）——分子平均密度 = 1 = 色图正中央，高密度更暖、低密度更冷。
- 轨道模式同样以「平均 |ψ| = 1」为基准（相位双色不变）；图例标注「颜色以分子平均电子密度归一（平均 = 1）」，面板元数据新增平均 ρ 显示。

### 实测（α-环糊精）
- 修复前 dAttr 分布：35% 粒子在 0.1–0.2（暗紫）；修复后：主体 0.4–0.7，平均 dAttr = 0.52 ≈ 0.5

### 验证
- node tools/validate-cube.mjs：59/59（颜色比例 O>C>H 保持）；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、parts/06b_cube_ui.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.0] — 2026-08-31 · 粒子总数滑块（Quantum Data 面板）
- **粒子总数滑块**（Quantum Data 面板）：控制当前电子云的总粒子数，拖动即时重采样生效（10k–600k，可超出 ULTRA 预设）；
  - 大分子（环糊精等）粒子不足时可手动调高；
  - 与画质档位联动：与某档位一致时高亮对应按钮，自定义数量时清除高亮；画质按钮切换仍快捷可用；
  - 附简要说明（粒子越多越密/大分子细节越完整/加重 GPU 负担）。

### 验证
- node tools/validate-cube.mjs：59/59；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK
- DOM 桩验证：初始同步 / 拖到预设档高亮 / 自定义数量清除高亮 / 画质切换回写滑块

### 文件
- 修改：parts/01_head.html、parts/06b_cube_ui.js、parts/05_render.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.4.0] — 2026-08-31 · 大分子原子覆盖基准（导入 Cube 采样优化）
- **大分子每原子粒子覆盖**（parts/03b_cube.js sampleCloudCube 两阶段采样）：
  - 密度加权部分（70%）：严格按体素密度比例（颜色 = 局部相对密度）；
  - 原子覆盖部分（30%）：均匀选原子 + 高斯散布（σ≈0.7Å），保证每个原子都有基准粒子（环糊精等几十上百原子时 H 原子不再被重原子挤没）；
  - 颜色/亮度统一按该点局部相对密度（同一色标，O>C>H 的比例关系清晰可见）；
  - 仅原子数 ≥ 16 时启用（小分子密度云本身已覆盖所有原子，无回归）。

### 验证
- node tools/validate-cube.mjs：59/59（新增：24 原子场每原子 ≥348 粒子/0.9Å、颜色 O(0.46)>C(0.40)>H(0.14)、小分子 12 原子不启用基准）
- node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、tools/validate-cube.mjs、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.3.1] — 2026-08-31 · 修复：切换画质档位后电子云消失/相位渲染丢失
- **根因**：setParticleCount 切换粒子数时 createCloud 重建整套 uniform，把轨道模式的 uOrbitalSign（置 0）、正/负相位 LUT（重置为默认色图）与 uScale（回退硬编码 1300）全部重置 —— 轨道模式下画质切换后相位双色丢失、粒子缩放错乱（观感即「云消失/变样」）。
- **修复**（parts/05_render.js）：
  - setParticleCount 重建云后，若处于导入模式则重放 setOrbitalRender（轨道模式恢复 uOrbitalSign=1 与固定相位 LUT；密度模式保持用户色图）；
  - 按当前窗口恢复 uScale/uPixelRatio（与 onResize 一致，不再回退 1300）；
  - writeCloudSample 补写 aOldPos/aOldProps（新几何一致性，防御性）。

### 验证
- node tools/validate-cube.mjs：56/56；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/05_render.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.3.0] — 2026-08-31 · 体素数据顺序自动检测（修复真实文件弥散）

### 修复（根因：数据布局）
- **发现真实文件的根因**：用户提供的 ASPIRIN_HOMO47.cub（Multiwfn）与萘电子密度 MDCM 文件均为 **z-fastest（zyx）体素顺序**，而非标准 Gaussian 的 x-fastest。按 x-fastest 读取会把分子密度峰打散成弥漫壳层 → 电子云弥散。
- **数据顺序自动检测**（parts/03b_cube.js）：用原子 3×3×3 邻域试 6 种体素布局，取「邻域 |值| 均值」最大者为正确布局（真实密度/轨道在原子核处取峰；π 轨道原子处有节面，邻域内仍有信号），非 x-fastest 时自动重排为标准顺序。
- **实测效果**：萘密度云 r max 11.7→4.4Å（>5Å 粒子 58%→0%），阿司匹林 HOMO 轨道 r max 9.7→5.1Å（hug 分子，π 轨道物理正确，相位 48/52）。

### 修复（视觉/取景，配合弥散观感）
- **导入后相机自动取景**（parts/05_render.js fitCameraToExtent）：按采样云实测范围拉远相机（半定量世界默认视野仅 ±4Å，导入结构常 10-20Å 会溢出屏幕 = 弥散观感）；退出导入复位。
- **密度模式分子包络空间上限**：丢弃距分子中心超过（R_mol+3.5Å）的体素（超大松盒的低幅值尾晕质量可占总量 10%+，纯质量阈值挡不住）；轨道模式保留完整瓣。
- **导入过渡改直线路径**（transitionCloudFromData direct）：不走大分子骨架，避免过渡期粒子沿长路径飞散。

### 验证
- node tools/validate-cube.mjs：56/56（新增 3 项布局检测测试：zyx 检测/重排质心/xyz 不误改）
- node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、parts/05_render.js、parts/06b_cube_ui.js、tools/validate-cube.mjs、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.2.0] — 2026-08-31 · 前线轨道可视化（双色相位粒子云）
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
