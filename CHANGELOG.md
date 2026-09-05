本项目采用语义化版本（SemVer）：主版本号 = 功能里程碑，次版本号 = 兼容性新功能，补丁号 = 修复。

## [v2.7.0] — 2026-09-05 · 新增：晶体模板扩至 232 个单质/二元/三元晶型，重构 Crystal Lab 界面

- Crystal Lab 模板由 57 个扩至 232 个、由 10 类二元晶型扩至 23 类，新增：
  - 单质：FCC/BCC/HCP 常见金属（Cu、Ag、Au、Al、Ni、Pt、Fe、Cr、W、Mo、Mg、Zn、Ti、Zr…）、金刚石 A4（C/Si/Ge/Sn）、石墨 A9；
  - 二元新晶型：黄铁矿 C2（FeS₂…）、赤铜矿 C3（Cu₂O/Ag₂O）、CdI₂ 2H 层状（CdI₂/PbI₂/1T-TiS₂ 族）、刚玉 D5₁（Al₂O₃/Fe₂O₃/Cr₂O₃…），并扩展现有岩盐/B2/闪锌矿/纤锌矿/萤石/反萤石/金红石/NiAs/2H-MoS₂ 家族；
  - 三元：钙钛矿 E2₁（SrTiO₃、BaTiO₃、CaTiO₃、PbTiO₃、KNbO₃…）、尖晶石 H1₁（MgAl₂O₄、ZnAl₂O₄、铁氧体族…）、方解石（Ca/Mg/Fe/Zn 碳酸盐）、锆石（Zr/Hf/Th/U 硅酸盐）。
- 数据模型由固定 A/B 二元扩展为 1–3 元素位（roles）：单质仅 A 位、二元 A/B、三元 A/B/C；CrystalCore 增加按原型生成的 roles 构建与三元素 build 入口，C 位可选中替换/随机掺杂。原有 kind 与模板行保持兼容。
- 新原型几何取自已核实的惯例胞坐标（AFLOW CIF + pymatgen 展开，配位数验证：金刚石 4、石墨层内 3、黄铁矿 Fe 6、赤铜矿 Cu 2、CdI₂ Cd 6、刚玉 Al 6、钙钛矿 Ti 6/Sr 12、尖晶石 Mg 4/Al 6、方解石 Ca 6、锆石 Zr 8/Si 4）；位点配比、周期权重与导出原子数全部校验。
- 显式载入单晶胞，同步元素、a、c/a 和内部坐标；保留自由编辑、扩胞、位点掺杂、生成重置和原有弛豫接口。计算或导入期间禁止载入模板。
- 参数标为近似起始值，晶型附 AFLOW/COD 来源；完整覆盖范围与科学约定见 docs/CRYSTAL_TEMPLATES.md。编辑历史记录生成参数及模板标识。
- validate-crystal 21/21：覆盖全部模板配比、边界折算、序列化、各晶型近邻配位、内部参数和扩胞；原有 FCC/BCC/HCP 检查保留。
- Crystal Lab 界面整体重构（全应用统一设计语言）：顶部引擎状态栏（连接绿点/加载脉冲/离线灰）+ 左侧「01 结构参数 / 02 位点与掺杂 / 03 结构弛豫」三栏 + 中央视图舞台（化学式头标、图例、适配）+ 底部选中原子/结果/状态工作台；字体栈与标题/标签/提示文字规格、:root 色板令牌统一到现有面板体系，按钮复用 .dshell-btn/.dshell-btnGhost，图标沿用 Lucide 线条风格，桌面与窄屏响应式；无新增素材或依赖。
- 修复：引擎状态圆点此前仅 CSS 定义三态而 JS 未接线，现按 连接/加载/离线 正确点亮。
- 修复：弛豫结果作为新起点（adopt）后，边界原子显示不再因坐标微偏理想面而缺失闭盒镜像（boundaryImages 增加 0.25 Å 显示容差，内部原子不受影响，计算/导出与权重折算不变）。
- 浏览器验证桌面及 390px 窄屏、模板切换、单质/二元/三元折算、扩胞与 A/B/C 位掺杂、生成复原；2H-MoS₂ 本地 MACE 固定晶胞弛豫 2 步收敛（链路验证，不作体系精度基准）。原有 sigma 15/15、Cube 73/73、构建语法检查通过。

## [v2.6.0] — 2026-09-05 · 新增：全屏晶体实验室与本地结构弛豫

### 新增
- 底部与创造模式、Quantum Data 并列的晶体入口；独立全屏工作区和渲染器，退出恢复原场景。
- B2 / BCC / FCC / HCP 建模、可编辑元素与晶格参数、超胞、位点替换、随机掺杂和空位（最多 512 个独立原子）。晶格常数旁新增“生成”，按当前参数恢复未掺杂、未弛豫的初始猜测结构。
- 周期边界镜像完整显示并正确折算：最小 FCC 显示 14 个球、折算 4 个原子；角/棱/面分别按 1/8、1/4、1/2。镜像共享独立位点 ID，不增加计算原子数。
- ASE / MACE-MPA-0 本地计算服务：CPU float64，0 K 固定晶胞或零外压可变晶胞优化，进度、停止、连接恢复与模型元素兼容检查。
- 结果比较：能量、力、应力、位移 RMS、体积与近邻变化；初始轮廓、位移箭头、插值和显示倍率。能量为同成分弛豫能，显示插值不代表动力学。
- CIF / POSCAR / XYZ 结构导入，项目 JSON 导入/导出及 extended XYZ 导出；保留模型参数哈希、设置、编辑记录和计算帧。非正交周期几何使用最短镜像，CIF 无序占据明确拒绝。

### 实测与验证
- validate-sigma 15/15、validate-cube 73/73、validate-crystal 17/17、SYNTAX_OK；引擎 18/18（开启 RUN_REAL_MACE，包含真实模型）。
- 54 原子 Co 掺杂 B2 NiAl：固定晶胞 UI 示例 4 步收敛，最大原子力约 0.0022 eV/Å；可变晶胞示例 6 步收敛，最大原子力约 0.02518 eV/Å、体积变化约 +0.21695%。这些是计算链路验证，不是体系精度基准。
- 浏览器已验证入口切换、原有创造/Cube 状态恢复、真实结果项目导入、FCC 边界镜像选择与掺杂折算、“生成”恢复初始结构，以及桌面与 390px 小屏布局。

### 限制
- 科研结论需针对具体体系验证；本模块不输出电子密度。引擎与模型需单独安装，浏览器构建仍保持单文件产物。
- 本机 macOS 保存面板曾禁用“保存”；浏览器导出落盘尚未完成验证，界面仅报告已请求保存。项目 JSON 导入与数据序列化验证通过。

### 文件
- 新增：parts/03c_crystal.js、parts/05c_crystal_render.js、parts/06c_crystal_ui.js、crystal-engine/、tools/validate-crystal.mjs、AGENTS.md、MEMORY.md。
- 更新：parts/07_main.js、tools/build.mjs、index.html、README.md、CHANGELOG.md、docs/RESEARCH.md、docs/REFERENCES.md。

## [v2.5.16] — 2026-09-02 · 新增：等值面拟合精度 4x / 8x 档位

### 新增
- 拟合精度从 2 档扩为 4 档：标准 1x / 精细 2x / 超精细 4x / 极致 8x（每维细分 N 倍，仅活跃区域细分，大网格也可用）。
- 控制从 range 滑条改为下拉（1x 标准 / 2x 精细 / 4x 超精细 / 8x 极致），数值标签随档位更新（1x(standard)/2x(fine)/4x(ultra)/8x(extreme)）。
- setIsoRes 支持 {1,2,4,8}（旧值自动归入最近档位）；1x 仍走原始快路径。

### 实测
- 咖啡因 HOMO（111x98x64）：4x 约 239ms/228548 三角形，8x 约 1.2s/913996 三角形；c9h3cl3o3（119x122x37）8x 约 508ms/412442。8x 三角形近百万、半透明双面渲染，弱 GPU 可能掉帧，建议按需选择。
- validate 73/73 保持通过。

### 验证
- validate-cube 73/73；validate-sigma 15/15；SYNTAX_OK

### 文件
- parts/01_head.html、parts/05_render.js、parts/06b_cube_ui.js、index.html、CHANGELOG.md、README.md

## [v2.5.15] — 2026-09-02 · 新增：等值面拟合精度滑块（多边形细分）

### 新增
- 等值面细分精度：cubeMarchingCubes(vol, iso, sign, res) 支持 res 细分，res=2 时每个原始体素单元每维再分一倍，三线性插值采样，三角形约 4 倍、曲面更平滑。
- UI 滑块（仅等值面/both 模式显示）：新增“拟合精度”（标准 1x / 精细 2x），放在边界值/可见度滑块上方；粒子云模式隐藏。拖动即重建等值面（setIsoRes）。
- res=1 走原始快路径（零回归）。

### 实测
- 咖啡因 HOMO：res 1x 14260 三角形 -> res 2x 57132（4 倍），bbox 不变。
- validate 新增 3 项（res2 三角形增加、bbox 不变、res1 与默认一致），共 73/73。
- headless：等值面模式显示拟合精度滑块，拖动到 2x(fine) 即时生效；粒子云模式隐藏。

### 验证
- validate-cube 73/73；validate-sigma 15/15；SYNTAX_OK

### 文件
- parts/03b_cube.js、parts/05_render.js、parts/06b_cube_ui.js、parts/01_head.html、tools/validate-cube.mjs、index.html、CHANGELOG.md、README.md

---

## [v2.5.14] — 2026-09-02 · 等值面模式滑块复用：边界值大小 + 边界可见度

### 新增
- **滑块随轨道显示模式切换**（parts/01_head.html + parts/06b_cube_ui.js）：
  - 粒子云模式：滑块保持「粒子总数」（10000–600000）+「粒子可见度」（0.1–1.4）；
  - 等值面模式（isosurface / both）：同一对滑块动态改为「**边界值大小**」（5%–50% × 各相位 max|ψ|，拖动即重建等值面）+「**边界可见度**」（0.1–1.0 表面不透明度，拖动即时生效不重建）；
  - 切回粒子云自动恢复原标签/范围/值。
- **渲染支持**（parts/05_render.js）：ISO_FRACTION → 可变 isoFraction；新增 setIsoFraction(v, vol)（重建）与 setIsoOpacity(v)（仅更新材质不透明度）。

### 实测
- headless：边界值 8% → 等值面暖橙 2818 + 冷蓝 11634 px；35% → 984 + 4152 px（面积随边界值单调变化，拖动即时重建）。
- 滑块标签/范围/值切换正确（cloud↔isosurface 往返恢复）。

### 验证
- node tools/validate-cube.mjs：70/70；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/01_head.html、parts/06b_cube_ui.js、parts/05_render.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.13] — 2026-09-02 · 改进：轨道等值面每相位独立阈值 + 降低碎片化

### 改进
- **每相位独立等值面阈值**（parts/05_render.js）：正/负相位分别按各自 max|ψ| × 20% 设阈值——正/负瓣幅值常不对称（实测 c9h3cl3o3 负瓣 max 0.116 > 正瓣 0.096），用全局 max 会让较弱相位阈值偏高 → 表面过度碎片化。
- **默认阈值 30% → 20%**：稀疏轨道（c9h3cl3o3 高值区仅 0.1% 体素）在 30% 阈值下等值面碎裂成孤立小块，20% 使表面更连贯（c9 正瓣三角形 1812 → 5218、负瓣 2438 → 4810）。
- **不透明度 0.55 → 0.7**：等值面更清晰可辨。

### 实测
- 咖啡因 HOMO 等值面：正瓣 7352 + 负瓣 7144 = 14496 三角形；c9h3cl3o3：10028 三角形（均贴合分子，不外插）。
- headless 截图：c9 暖橙像素 1104 → 2412（正瓣更完整可见）。

### 验证
- node tools/validate-cube.mjs：70/70；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/05_render.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.12] — 2026-09-02 · 修复：轨道等值面负相位外插（巨大蓝色多边形）

### 修复
- **根因**（parts/03b_cube.js cubeMarchingCubes）：负相位（sign<0）等值面插值时误用 `+iso` 而非 `-iso`——`t = (iso - v0)/(v1 - v0)` 对负值域（v0,v1<0）算出 t>1 或 t<0，顶点被线性外插到网格外 → 负瓣等值面铺满大半盒子（实测咖啡因 HOMO 负瓣 bbox 34×54×35Å，远超分子）→ 渲染成巨大蓝色多边形块。
- **修复**：插值 target 与 cubeIndex 判定一致（sign>0 → iso，sign<0 → -iso），顶点严格内插在 0..1 区间。

### 实测
- 咖啡因 HOMO 负瓣 bbox：34×54×35Å（外插，错误）→ 6.4×5.0×2.1Å（贴合分子，与正瓣 6.3×5.0×2.0Å 一致）。

### 验证
- node tools/validate-cube.mjs：70/70（新增「负瓣等值面贴合分子不外插」回归测试）；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、tools/validate-cube.mjs、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.11] — 2026-09-02 · 新增：前线轨道等值面模式（Marching Cubes 双相位网格）

### 新增
- **轨道等值面**（parts/03b_cube.js + parts/05_render.js）：前线轨道（HOMO/LUMO 等带符号 Cube）新增等值面渲染——纯 JS Marching Cubes（标准 256 条目边/三角表）从体素生成 ±iso 两个网格：**正相位暖橙半透明表面 + 负相位冷蓝半透明表面**（等值面阈值 = 30% × max|ψ|）。
- **显示模式切换**（parts/06b_cube_ui.js + parts/01_head.html）：轨道模式下新增「轨道显示」下拉（粒子云 / 等值面 / 等值面+粒子云），粒子云隐藏/显示联动；退出导入自动清理等值面。
- Marching Cubes 为纯 JS 无 THREE 依赖，Node 可测（validate-cube.mjs 新增 4 项：正/负瓣三角形、顶点有限、法线同长）。

### 验证
- node tools/validate-cube.mjs：69/69（新增等值面 4 项）；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK
- headless 实测：咖啡因 HOMO 等值面渲染成功（正瓣暖橙 432 像素 / 负瓣冷蓝 57792 像素）；三种模式（cloud/both/isosurface）切换正常，粒子云显隐联动正确

### 文件
- 修改：parts/03b_cube.js（Marching Cubes）、parts/05_render.js（等值面渲染）、parts/06b_cube_ui.js（显示模式）、parts/01_head.html（下拉）、tools/validate-cube.mjs（测试）、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.10] — 2026-08-31 · 新增：粒子可见度滑块（Quantum Data 面板，粒子总数下方）

### 新增
- Quantum Data 面板在「粒子总数」滑条下方新增「粒子可见度」滑条（0.1–1.4），控制粒子云亮度/可见度（uCloudAlpha → 顶点着色器 vBright）。
- 对半定量模式与导入的电子密度（Cube）均生效；与调试面板的 Cloud alpha 共享 SETTINGS.cloudAlpha，两处联动（每帧 tick 同步 uniform）。
- 拖动即时生效；大分子（环糊精等）粒子密集时调低可见度可避免过曝，调高可看清稀薄区域。

### 验证
- node tools/validate-cube.mjs：65/65；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK
- headless 实测：滑条可见、初始 0.6 同步 uniform、拖动至 1.0 后数值与 uniform 均更新

### 文件
- 修改：parts/01_head.html（滑条行 + 样式）、parts/06b_cube_ui.js（绑定逻辑）、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.9] — 2026-08-31 · 修复：伪原子文件（CPMD）数据序检测失效导致电子云弥散

### 修复
- **根因**：CPMD 伪原子文件（如 913 原子蛋白-配体 bohr.cube）原子坐标为 Å、网格轴/原点为 bohr——数据序检测用原子坐标算网格索引时混用单位，检测到错误的布局（yxz）且重排阈值 1.5 倍过严拒绝重排 → buildCubeVolume 按错误布局采样 → 电子云弥散铺满整个盒子（粒子 r95=46Å 盒边）。
- **单位自适应**（parts/03b_cube.js）：数据序检测前用最近邻距离中位数判定原子坐标单位（<1.5 → Å，坐标 ÷ bohr→Å 系数统一到网格单位）再计算原子网格索引；检测循环改用换算后的坐标。
- **重排阈值放宽**：1.5 倍 → max(1.15 倍, +0.01)，保证真实非 x-fastest 文件（实测 zyx 仅为 xyz 的 ~1.4 倍）被正确重排。

### 实测
- 913 原子 CPMD 蛋白-配体：数据序从错误的 yxz 修正为 zyx；粒子云从弥散全盒（r95≈46Å 盒子边缘）→ 集中在分子区域（r50=14.9 / r80=20.2 / r95=22.9Å，分子实际 ~34.8Å 跨度）。
- 回归：benzene/water/ethanol/co/ammonia 等 cclib 文件数据序检测与渲染无变化（zyx/zxy 布局照常）；伪原子检测、元素推断、势场路由均不受影响。

### 验证
- node tools/validate-cube.mjs：65/65（含 zyx 检测/重排/xyz 不误改）；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、index.html（组装产物）、CHANGELOG.md、README.md

---

## [v2.5.8] — 2026-08-31 · 原子适配：扩展元素视觉表 + CPMD 伪原子检测与元素几何推断

### 新增
- **元素视觉表扩展**（parts/03_core.js）：ELEMENTS 从 6 种（H/C/N/O/F/Cl）扩至 30 种——新增 B/Si/P/S/Br/I、碱金属（Li/Na/K）、碱土（Mg/Ca）、过渡金属（Fe/Zn/Cu/Mn/Co/Ni/Mo），CPK 惯例配色 + 共价半径球。导入含 S/P/Br/I/金属的 Cube 时骨架不再一律灰球。
- **CPMD 伪原子检测**（parts/03b_cube.js）：原子序数恰为 1..N 连续标签且电荷列呈部分电荷特征 → 标记 pseudoZ（CPMD 等将原子序数写成类型索引，非真实元素）。
- **元素几何推断**（inferCubeElements）：对伪原子文件按键长/配位数启发式推断 C/H/N/O/S——H（短键单邻 <1.3Å）、C（4 配位/sp²）、N（2-3 配位）、O（1-2 配位短键）、S（1.8Å 级）；坐标单位自适应（最近邻中位数 <1.5Å 判 Å，否则 bohr）；配位数普遍 >8（部分电荷网格点）时放弃推断全部中性 X。
- **伪原子坐标按 Å 读**：CPMD 伪原子文件原子坐标实测为 Å（键长 1.0-1.5Å、键角 109°），不再误乘 bohr→Å 系数——913 原子蛋白-配体骨架从 18.5Å 修正为 34.8Å（真实尺寸）。

### 验证
- node tools/validate-cube.mjs：65/65（新增伪原子检测/元素推断/Å 单位读取/真实元素不误判 4 项）；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK
- CH4 伪装伪原子：推断 C,H,H,H,H ✓；真实元素序数不触发伪原子 ✓；headless 实测 913 原子导入正常（骨架按 Å、元素有区分）

### 文件
- 修改：parts/03_core.js、parts/03b_cube.js、tools/validate-cube.mjs、CHANGELOG.md、README.md

---

## [v2.5.7] — 2026-08-31 · 修复：势场 Cube（Hartree/ESP 等非电子密度）被误按密度导入导致弥散

### 修复
- **根因**：CP2K 等导出的 Hartree 势场（长程库仑势，处处非零、常带符号）被当作电子密度处理——注释行 "HARTREE POTENTIAL" 未被字段类型识别（fallback 到 mixed_small_negative），按密度模式时 cutoff（0.1%×峰值）截不掉势场背景 → 保留 90% 体素 → 粒子云铺满全盒弥散，且分子在网格角落时骨架与云错位。
- **字段类型识别**（parts/03b_cube.js）：FIELD_HINT_KEYS 新增 `hartree: ["hartree"]`——注释含 "HARTREE" 即高置信标注为 hartree（非电子密度）。
- **路由**（parts/06b_cube_ui.js）：势场类（orbital/hartree/esp/laplacian/elf/signed_field）一律按带符号（双色相位）模式路由，不再落入密度模式；ready 状态文案区分「Hartree 势场 / 静电势 ESP / 分子轨道」（非电子密度），元数据标签新增「Hartree 势（非电子密度）」。
- **样例分类修正**：cp2k_benzene_Hartree.cube 从 electron_density/ 移入 orbital/（势场样本），README 说明其来自 CP2K 周期体系（tipscan）、分子位于网格一角。

### 实测
- cp2k_benzene_Hartree.cube：修复前 kept 90.1%（弥散）→ 修复后 kept 2.8%（粒子集中在势场高幅值区，双色相位）；字段类型 high 置信「Hartree 势（非电子密度）」。
- 回归：苯/水/913 原子蛋白等密度文件仍走 density 模式；Mn2GeO4 自旋密度/咖啡因 HOMO/ESP 仍走双色相位。

### 验证
- node tools/validate-cube.mjs：61/61（新增 hartree 识别 2 项）；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK

### 文件
- 修改：parts/03b_cube.js、parts/06b_cube_ui.js、tools/validate-cube.mjs、docs/REFERENCES.md（Resource 38）、sample-cubes/README.md、CHANGELOG.md、README.md

---

## [v2.5.6] — 2026-08-31 · 扩展：更多开源 Cube 样例（含 913 原子大分子）/ 修复验证脚本测试数据

### 新增样例（sample-cubes/，未纳入 git，来源记录见 docs/REFERENCES.md Resources 37–39）
- **大分子**：`electron_density/protein_ligand_913atoms_CPMD_3Dmol.cube`——CPMD 蛋白-配体密度，913 原子 / 129×97×97 网格 / 121 万体素（3Dmol.js bohr.cube，BSD-3）；正网格数、yxz 数据序自动检测正确，可完整导入（67% 体素保留、160k 粒子实测正常）。
- **超大分子（unsupported）**：`unsupported/protein_4667atoms_CPMD.cube`——4667 原子蛋白质密度（3Dmol.js 4dln.cube，BSD-3），负网格数 + 130MB 超 64MB 上限。
- **ESP 场类型**：`orbital/psi4_water_ESP.cube`（Psi4 水 ESP，43% 负值）、`orbital/water_ESP_80grid.cube`（80³ 网格水 ESP，52.5% 负值）——负值 >20% 自动进入双色相位模式，面板诚实标注「静电势 ESP（非电子密度）」。
- **Psi4 密度**：`electron_density/psi4_water_Dt.cube`；**CP2K 势场**：`electron_density/cp2k_benzene_Hartree.cube`（Hartree 势，8.3% 负值噪声按密度模式导入）。
- **unsupported 变体**：`vspin_4datasets.cube`（体素数恰为 4 数据集）、`twoc_cd_mo48_multidataset.cube`（负原子数 + 48 数据集，双分量）。

### 修复
- **validate-cube.mjs 测试数据 bug**：末尾「小分子」用例声明 12 原子但实际写入 14 行原子（2 C + 12 H），导致 DATA_COUNT 崩溃 → 声明修正为 14（仍 <16 阈值，验证「小分子不启用每原子基准」的意图不变），测试恢复 59/59。

### 验证
- node tools/validate-cube.mjs：59/59；node tools/validate-sigma.mjs：15/15；node tools/build.mjs：SYNTAX_OK
- headless Chrome 实测 913 原子导入：state=applied、160k 粒子、67% 体素保留、相机自动取景正常

### 文件
- 新增：docs/REFERENCES.md（Resources 37–39）、sample-cubes/README.md（本地样例目录）
- 修改：tools/validate-cube.mjs、CHANGELOG.md、README.md

---

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
