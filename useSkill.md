# Skill 使用说明

## 文档目的

这份文档用于说明：在本项目里，如何选择和使用这 3 个专门服务于工具页开发流程的 Skill：

- `repo-tool-page-builder`
- `repo-tool-polish`
- `prototype-fidelity`

这 3 个 Skill 不是互相替代关系，而是互相配合的关系。它们最核心的区别，不是“前端 / 非前端”，而是 **你当前处在哪一个工作阶段**：

- 新建一个工具页
- 继续打磨一个已经存在的工具页
- 按原型高保真、一比一地修正现有实现

另外，当前仓库已经不是“只做本地存储的静态工具页仓库”，而是一个 **本地优先、可选接入 Supabase 云同步** 的纯前端工具仓库。因此在使用 `repo-tool-page-builder` 和 `repo-tool-polish` 时，还需要额外判断：

- 这个工具页是不是只做本地持久化
- 这个工具页是否要接入仓库现有的 Supabase 配置 / 登录 / 云同步范式
- 这个工具页如果接入云同步，应走 `tool_documents` 快照同步还是结构化数据表同步
- 在真正改代码前，是否需要先读取对应 Skill 要求的仓库约定文档

## 快速选择

| 如果你的情况是…… | 优先使用这个 Skill |
|---|---|
| 你要在 `tools/` 下新增一个工具页 | `repo-tool-page-builder` |
| 页面已经存在，你现在要修一个 bug | `repo-tool-polish` |
| 页面功能没问题，但看起来不像原型 | `prototype-fidelity` |
| 你要新增页面，而且用户还要求一比一还原原型 | `repo-tool-page-builder` + `prototype-fidelity` |
| 你在修已有页面的 bug，同时还要加强视觉还原度 | `repo-tool-polish` + `prototype-fidelity` |
| 你要新增一个未来需要云同步的新工具页 | `repo-tool-page-builder` |
| 你要先判断新工具应该走 `tool_documents` 还是结构化表同步 | `repo-tool-page-builder` |
| 页面已经接入 Supabase，同步 UI / 配置状态 / 空云端逻辑出了问题 | `repo-tool-polish` |
| 页面已经接入 Supabase，登录后 hydration 或本地缓存判定出了问题 | `repo-tool-polish` |

## 详细使用说明表

| Skill | 主要用途 | 适合在什么情况下使用 | 什么情况下不应该作为第一选择 | 推荐组合方式 | 用户提示词写法建议 | 示例提示词 |
|---|---|---|---|---|---|---|
| `repo-tool-page-builder` | 在当前仓库中创建或扩展一个工具页，并接入 landing 首页入口；必要时决定它是本地-only 还是 Supabase-aware | 你正在 `tools/` 下创建一个新工具；你需要在 `scripts/landing.js` 中增加首页卡片；你需要一个纯前端、相对路径安全、可用于 GitHub Pages 的工具页；你需要为新工具决定持久化方式和是否接入 Supabase | 页面已经存在，而且这次工作只是一个小样式调整或一个局部 bug 修复；真正的问题是“它还不够像原型”，而不是“它还没有被建出来并接入仓库” | 当用户明确说“必须严格还原”“要一比一”“必须和设计稿一致”时，和 `prototype-fidelity` 组合使用 | 明确告诉 Skill：原型素材在哪里、工具页要放在哪个文件夹、技术栈约束是什么、是否需要接入 landing 页入口、是否需要沿用当前仓库的 Supabase-aware 范式 | `请使用 $repo-tool-page-builder，在 tools/ 下根据 D:\File\example 里的原型素材创建一个新的纯 HTML/CSS/JS 工具页，补充 landing 页卡片入口，并明确按本地优先 + 可选 Supabase 同步的仓库范式来实现。` |
| `repo-tool-polish` | 对一个已经存在的工具页做有针对性的后续修复，并在浏览器里验证结果；必要时一并检查同步态 | 页面已经存在；需求是修 bug、调样式、修 hover、修弹窗、修禁用态、修滚动表现、修动画、修列表更新、修全屏逻辑；或者当前页面已经接入 Supabase，需要修配置态、登录态、空云端行为、本地缓存判定等 | 你是在从零创建一个新工具页；任务主体是新增完整页面；用户明确要求的是“整屏高保真复刻原型”，而不是局部修复 | 当局部修复逐渐演变成“整页仍然不像原型”时，与 `prototype-fidelity` 组合使用 | 明确告诉 Skill：受影响的是哪个现有工具目录、具体 bug 或界面问题是什么、哪些浏览器行为必须被验证、是否已经接入 Supabase | `请使用 $repo-tool-polish，修复 tools/flora-knowledge-atlas 这个现有工具页的同步 UI 问题，确认未配置 / 已配置未登录两种状态都正确，并在浏览器中验证最终效果。` |
| `prototype-fidelity` | 以“原型是唯一视觉参照”为前提，推动一轮高保真复刻修正 | 用户明确说了“要一比一”“要严格还原原型”“现在看起来和原稿不一样”“布局不对”“间距和字体不对”“不要只做成能用，要做得一样” | 任务只是仓库结构接入；任务只是一个很小的功能 bug，且没有更广泛的视觉还原要求；用户只想要一个快速可用的功能修复 | 新页面从原型开始做时，与 `repo-tool-page-builder` 组合；已有页面要朝原型继续逼近时，与 `repo-tool-polish` 组合 | 明确告诉 Skill：原型素材是什么，当前实现是什么，需要拿什么去和原型逐项比对 | `请使用 $prototype-fidelity，对比 tools/policy-codex 的当前实现与我提供的原型 HTML 和截图，找出最关键的视觉差异，并推动一轮一比一还原修正。` |

## 新增的 Supabase-aware 边界说明

### 1. `repo-tool-page-builder` 现在不再默认等于“纯本地工具页生成器”

现在使用它时，要先决定工具页属于哪一种：

- 纯本地工具页
- 本地优先 + Supabase 快照同步工具页
- 本地优先 + Supabase 结构化表同步工具页

如果任务中提到以下内容，就应该在提示词中明确指出：

- 多设备同步
- 邮箱登录
- 云端恢复
- 本地缓存迁移到云端
- 未来接入图片云存储

同时最好在提示词里顺手说清楚，你更倾向哪一种同步模型：

- 轻量页面整体快照同步：`tool_documents`
- 结构化对象增删改查同步：独立业务表

这时 `repo-tool-page-builder` 需要遵循的不是旧的 local-only 范式，而是当前仓库的共享 Supabase 范式，包括：

- `scripts/supabase-config.js`
- `scripts/supabase-browser.js`
- `scripts/vendor-supabase.js`
- `supabase/index.html`
- `supabase/README.md`

并且它还应该先阅读 Skill 自己要求的仓库约定文档：

- `repo-tool-page-builder` 对应 `references/repo-conventions.md`
- `repo-tool-polish` 对应 `references/polish-conventions.md`

### 2. `repo-tool-polish` 现在不再只等于“修 UI 和交互 bug”

如果页面已经接入 Supabase，那么这些问题也应优先由 `repo-tool-polish` 负责：

- 顶部同步状态文案不对
- “连接云同步”按钮状态不对
- 配置后页面没进入可连接状态
- 空云端时错误保留 demo 数据
- 本地缓存判定过宽，误把 demo 当成真实用户数据
- 登录后没有触发页面 hydration

也就是说，对于 Supabase-aware 工具页，`repo-tool-polish` 的验收范围现在包括：

- 样式
- 交互
- 浏览器真实行为
- 同步状态
- 本地 / 云端边界逻辑
- 登录后的页面 hydration
- 已配置 / 未配置两种入口状态

## 边界规则

### 1. 当页面还不存在时，优先使用 `repo-tool-page-builder`

如果任务包含以下任意内容，就应该先选 `repo-tool-page-builder`：

- 在 `tools/` 下新建一个文件夹
- 决定工具目录名
- 新建 `index.html`、`styles.css`、`app.js` 或配套资源
- 在 `scripts/landing.js` 中增加新卡片
- 确保相对路径适配 GitHub Pages
- 决定这个新工具页是 local-only 还是 Supabase-aware

这个 Skill 负责的是 **“把页面做出来，并正确接入仓库”这一层**。

### 2. 当页面已经存在时，优先使用 `repo-tool-polish`

如果页面已经存在，而且用户说的是下面这类问题，就应该先选 `repo-tool-polish`：

- “这里有个 bug”
- “这个按钮点不了”
- “这个弹窗关闭逻辑不对”
- “这里的 hover 效果不对”
- “请调整这个过渡动画”
- “请把这个滚动条隐藏掉”
- “请让这个状态立即更新”
- “配置 Supabase 后这里的同步状态不对”
- “云端空库时不应该显示 demo 数据”

这个 Skill 负责的是 **“已有页面的小范围修复、微调和验收”这一层**。

### 3. 当真正目标是“看起来必须像原型”时，使用 `prototype-fidelity`

如果用户表面上说的是“调样式”，但真实意思其实是下面这些，就应该加上 `prototype-fidelity`：

- “现在这不是原型长这样”
- “你必须一比一还原”
- “布局、间距、字体、配色都不对”
- “不要只是大概像，得尽量一样”

这个 Skill 负责的是 **“和原型逐项比对，并以原型为准修正实现”这一层**。

## 组合使用规则

### `repo-tool-page-builder` + `prototype-fidelity`

适用于：

- 你要新建一个工具页
- 用户同时要求高保真还原、接近原型甚至一比一复刻

可以这样理解二者分工：

- `repo-tool-page-builder` 负责回答：“这个页面如何正确地落进仓库并接入站点？是否要接入 Supabase-aware 范式？”
- `prototype-fidelity` 负责回答：“这个页面现在到底像不像原型，还差哪些关键视觉项？”

推荐提示词：

```text
请使用 $repo-tool-page-builder 和 $prototype-fidelity，根据 D:\File\example 中的原型素材在 tools/ 下新建一个工具页，补充 landing 页入口，并尽可能让最终页面与提供的原型 HTML 和截图保持高度一致。如果该工具后续需要跨设备同步，请按当前仓库的 Supabase-aware 范式接入。
```

### `repo-tool-polish` + `prototype-fidelity`

适用于：

- 页面已经存在
- 现在既有交互 bug
- 用户还明确表示页面整体仍然不像原型

可以这样理解二者分工：

- `repo-tool-polish` 负责回答：“这个现有页面要怎么安全地复现问题并修掉？如果它接入了 Supabase，同步状态有没有一起被破坏？”
- `prototype-fidelity` 负责回答：“除了 bug 之外，还有哪些视觉差异阻碍了一比一还原？”

推荐提示词：

```text
请使用 $repo-tool-polish 和 $prototype-fidelity，检查 tools/policy-codex 这个现有工具页，先修复我提到的交互 bug 和同步状态问题，再对照我提供的原型 HTML 和截图做更严格的高保真修正。
```

## 提示词编写建议

### 建议 1：一定要说明这是“新页面”还是“已有页面”

好的写法：

```text
请使用 $repo-tool-polish，继续修改 tools/flora-knowledge-atlas 这个已经存在的工具页……
```

不好的写法：

```text
请帮我改一下这个页面……
```

原因：第一句话往往就决定了助手应该走“新建流程”“修 bug 流程”还是“高保真比对流程”。

### 建议 2：如果你已经知道目标目录名，就直接写出来

好的写法：

```text
请使用 $repo-tool-page-builder，在 tools/chronicles-history-map 下创建这个工具页……
```

不好的写法：

```text
请再加一个工具页……
```

原因：明确目录可以减少仓库接入时的歧义。

### 建议 3：当高保真很重要时，要明确说出来

好的写法：

```text
请使用 $prototype-fidelity，并把我提供的原型 HTML 当作唯一视觉标准。
```

不好的写法：

```text
帮我把它做得更好看一点。
```

原因：“更好看一点”只会触发普通润色；“把原型当成唯一视觉标准”才会触发 fidelity-first 的工作方式。

### 建议 4：如果浏览器中的真实行为很重要，就明确要求做浏览器验证

好的写法：

```text
请使用 $repo-tool-polish，修复这个弹窗 bug，并在浏览器里验证完整流程。
```

原因：这会推动流程先复现、再修复、再验证，而不是只在代码里猜测问题。

### 建议 5：如果技术栈或部署约束不能变，就在提示词里写清楚

示例：

```text
请使用 $repo-tool-page-builder，创建一个纯 HTML/CSS/JS 的工具页，所有资源都放在 tools/my-tool 下，并保持 GitHub Pages 友好的相对路径结构。
```

### 建议 6：如果你希望新工具页加入云同步，一定要直接写出来

好的写法：

```text
请使用 $repo-tool-page-builder，新建一个工具页，并按当前仓库的 Supabase-aware 范式实现本地优先 + 云同步能力。
```

不好的写法：

```text
请新建一个工具页，后面可能还要同步。
```

原因：前一种写法会让 Skill 从一开始就决定数据模型、同步 UI、配置入口和文档接入；后一种容易让页面先按 local-only 做出来，后续再返工。

### 建议 7：如果页面已经接入 Supabase，修 bug 时要把这一点写在提示词里

好的写法：

```text
请使用 $repo-tool-polish，修复 tools/policy-codex 这个已接入 Supabase 的工具页，检查同步状态、空云端逻辑和浏览器交互是否一致。
```

原因：这会明确提示 Skill 把同步态也纳入验收范围，而不是只盯局部 CSS 或按钮点击。

### 建议 8：如果你已经知道同步模式，也要在提示词里写出来

好的写法：

```text
请使用 $repo-tool-page-builder，新建一个工具页，并按当前仓库的 Supabase-aware 范式实现；同步方式优先采用 `tool_documents` 页面快照同步。
```

或者：

```text
请使用 $repo-tool-page-builder，新建一个工具页，数据按结构化业务表同步，不要做成单一 JSON 快照。
```

原因：这会直接影响数据模型、保存逻辑、迁移方式，以及后续是否容易扩展筛选、局部更新和图片资源管理。

## 使用前置要求

在这三个 Skill 里，真正有强前置阅读要求的是前两个：

- 使用 `repo-tool-page-builder` 前，应该按 Skill 说明先读 `references/repo-conventions.md`
- 使用 `repo-tool-polish` 前，应该按 Skill 说明先读 `references/polish-conventions.md`
- 使用 `prototype-fidelity` 时，则要把原型 HTML、截图、设计语言文档当成核心输入

如果你的提示词里能直接点明这些输入已经存在，Skill 的执行会更稳定。例如：

```text
请使用 $repo-tool-polish，按该 Skill 的仓库约定继续处理 tools/policy-codex，重点检查 Supabase 配置态、登录后 hydration 和浏览器交互。
```

## 推荐提示词模板

### 模板 A：新增工具页

```text
请使用 $repo-tool-page-builder，根据 <path> 中的原型素材在 tools/<tool-name>/ 下创建一个新的工具页。实现必须保持纯 HTML/CSS/JS，并补充 landing 页卡片入口，同时确保结果适配 GitHub Pages 部署。
```

### 模板 A-2：新增带云同步能力的工具页

```text
请使用 $repo-tool-page-builder，根据 <path> 中的原型素材在 tools/<tool-name>/ 下创建一个新的工具页。实现必须保持纯 HTML/CSS/JS，并按当前仓库的 Supabase-aware 范式实现本地优先的数据持久化与可选云同步，补充 landing 页卡片入口，同时确保结果适配 GitHub Pages 部署。
```

### 模板 B：修已有页面 bug

```text
请使用 $repo-tool-polish，检查 tools/<tool-name>/ 这个已有工具页，先复现我描述的问题，再用最小范围的 HTML/CSS/JS 修改完成修复，并在浏览器中验证最终行为。
```

### 模板 B-2：修已有 Supabase-aware 页面 bug

```text
请使用 $repo-tool-polish，检查 tools/<tool-name>/ 这个已有且已接入 Supabase 的工具页，先复现我描述的问题，再修复同步状态、本地缓存边界或交互 bug，并在浏览器中验证未配置、已配置未登录或对应受影响状态。
```

### 模板 C：高保真修正现有页面

```text
请使用 $prototype-fidelity，对比 tools/<tool-name>/ 的当前实现与我提供的原型 HTML、截图和设计语言说明，并按“优先修正最大布局和视觉差异”的原则推动一轮一比一还原。
```

### 模板 D：新页面 + 严格还原原型

```text
请使用 $repo-tool-page-builder 和 $prototype-fidelity，在 tools/<tool-name>/ 下创建一个新工具页，接入 landing 首页，并把我提供的原型作为唯一视觉标准，完成一轮高保真还原。
```

### 模板 E：已有页面修 bug + 进一步提升还原度

```text
请使用 $repo-tool-polish 和 $prototype-fidelity，先修复 tools/<tool-name>/ 这个已有工具页中的浏览器交互问题，再把修正后的结果与原型对照，继续提升视觉还原度。
```

## 常见误用场景

| 误用方式 | 更好的选择 |
|---|---|
| 用 `repo-tool-page-builder` 去修一个已经存在页面里的小 CSS 问题 | 用 `repo-tool-polish` |
| 用 `repo-tool-polish` 去从零新建一个完整工具页 | 用 `repo-tool-page-builder` |
| 页面整体已经和原型差很大，却只用 `repo-tool-polish` 去修局部问题 | 加上 `prototype-fidelity` |
| 一个纯功能 bug，没有明显视觉还原要求，却直接使用 `prototype-fidelity` | 用 `repo-tool-polish` |
| 用户真实要求是“严格按原型来”，但提示词只写“帮我美化一下” | 明确写“请使用 `prototype-fidelity`，并把原型当成唯一视觉标准” |
| 新工具页未来需要同步，却只按 local-only 描述 | 在提示词中明确写“按当前仓库的 Supabase-aware 范式实现” |
| 已接入 Supabase 的页面出了状态 bug，却只写“修一下按钮样式” | 明确写出“同步状态 / 空云端 / 本地缓存边界”这些词 |

## 默认选择规则

如果你一时拿不准，可以先按下面这个默认顺序判断：

1. 如果页面还不存在，先用 `repo-tool-page-builder`。
2. 如果是新页面，而且你已经知道它未来要做云同步，就在提示词里把 “Supabase-aware” 写清楚。
3. 如果页面已经存在，而且问题是局部的，先用 `repo-tool-polish`。
4. 如果页面已经接入 Supabase，且问题涉及同步状态、本地缓存或云端 hydration，仍然优先用 `repo-tool-polish`。
5. 如果用户明确在意一比一还原原型，再加上 `prototype-fidelity`。
