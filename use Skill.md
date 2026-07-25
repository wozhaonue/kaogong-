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

## 快速选择

| 如果你的情况是…… | 优先使用这个 Skill |
|---|---|
| 你要在 `tools/` 下新增一个工具页 | `repo-tool-page-builder` |
| 页面已经存在，你现在要修一个 bug | `repo-tool-polish` |
| 页面功能没问题，但看起来不像原型 | `prototype-fidelity` |
| 你要新增页面，而且用户还要求一比一还原原型 | `repo-tool-page-builder` + `prototype-fidelity` |
| 你在修已有页面的 bug，同时还要加强视觉还原度 | `repo-tool-polish` + `prototype-fidelity` |

## 详细使用说明表

| Skill | 主要用途 | 适合在什么情况下使用 | 什么情况下不应该作为第一选择 | 推荐组合方式 | 用户提示词写法建议 | 示例提示词 |
|---|---|---|---|---|---|---|
| `repo-tool-page-builder` | 在当前仓库中创建或扩展一个工具页，并接入 landing 首页入口 | 你正在 `tools/` 下创建一个新工具；你需要在 `scripts/landing.js` 中增加首页卡片；你需要一个纯前端、相对路径安全、可用于 GitHub Pages 的工具页 | 页面已经存在，而且这次工作只是一个小样式调整或一个局部 bug 修复；真正的问题是“它还不够像原型”，而不是“它还没有被建出来并接入仓库” | 当用户明确说“必须严格还原”“要一比一”“必须和设计稿一致”时，和 `prototype-fidelity` 组合使用 | 明确告诉 Skill：原型素材在哪里、工具页要放在哪个文件夹、技术栈约束是什么、是否需要接入 landing 页入口 | `Use $repo-tool-page-builder to create a new pure HTML/CSS/JS tool under tools/ from the prototype folder at D:\\File\\example, add a landing card entry, and keep all assets GitHub Pages friendly.` |
| `repo-tool-polish` | 对一个已经存在的工具页做有针对性的后续修复，并在浏览器里验证结果 | 页面已经存在；需求是修 bug、调样式、修 hover、修弹窗、修禁用态、修滚动表现、修动画、修列表更新、修全屏逻辑，或者做浏览器侧验收 | 你是在从零创建一个新工具页；任务的主体是新增完整页面；用户明确要求的是“整屏高保真复刻原型”，而不是局部修复 | 当局部修复逐渐演变成“整页仍然不像原型”时，与 `prototype-fidelity` 组合使用 | 明确告诉 Skill：受影响的是哪个现有工具目录、具体 bug 或界面问题是什么、哪些浏览器行为必须被验证 | `Use $repo-tool-polish to fix the existing tool at tools/flora-knowledge-atlas so the gallery hint is lighter, the scrollbar is hidden, and the final result is verified in the browser.` |
| `prototype-fidelity` | 以“原型是唯一视觉参照”为前提，推动一轮高保真复刻修正 | 用户明确说了“要一比一”“要严格还原原型”“现在看起来和原稿不一样”“布局不对”“间距和字体不对”“不要只做成能用，要做得一样” | 任务只是仓库结构接入；任务只是一个很小的功能 bug，且没有更广泛的视觉还原要求；用户只想要一个快速可用的功能修复 | 新页面从原型开始做时，与 `repo-tool-page-builder` 组合；已有页面要朝原型继续逼近时，与 `repo-tool-polish` 组合 | 明确告诉 Skill：原型素材是什么，当前实现是什么，需要拿什么去和原型逐项比对 | `Use $prototype-fidelity to compare tools/policy-codex against the provided prototype HTML and screenshots, identify the highest-signal visual mismatches, and drive a one-to-one fidelity pass.` |

## 边界规则

### 1. 当页面还不存在时，优先使用 `repo-tool-page-builder`

如果任务包含以下任意内容，就应该先选 `repo-tool-page-builder`：

- 在 `tools/` 下新建一个文件夹
- 决定工具目录名
- 新建 `index.html`、`styles.css`、`app.js` 或配套资源
- 在 `scripts/landing.js` 中增加新卡片
- 确保相对路径适配 GitHub Pages

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

- `repo-tool-page-builder` 负责回答：“这个页面如何正确地落进仓库并接入站点？”
- `prototype-fidelity` 负责回答：“这个页面现在到底像不像原型，还差哪些关键视觉项？”

推荐提示词：

```text
Use $repo-tool-page-builder and $prototype-fidelity to build a new tool under tools/ from the prototype folder at D:\File\example, add the landing-page entry, and keep the final page as close as possible to the provided prototype HTML and screenshots.
```

### `repo-tool-polish` + `prototype-fidelity`

适用于：

- 页面已经存在
- 现在既有交互 bug
- 用户还明确表示页面整体仍然不像原型

可以这样理解二者分工：

- `repo-tool-polish` 负责回答：“这个现有页面要怎么安全地复现问题并修掉？”
- `prototype-fidelity` 负责回答：“除了 bug 之外，还有哪些视觉差异阻碍了一比一还原？”

推荐提示词：

```text
Use $repo-tool-polish and $prototype-fidelity to inspect the existing tool at tools/policy-codex, fix the reported interaction bugs, and then compare it against the supplied prototype HTML and screenshots for a stronger fidelity pass.
```

## 提示词编写建议

### 建议 1：一定要说明这是“新页面”还是“已有页面”

好的写法：

```text
Use $repo-tool-polish to update the existing tool at tools/flora-knowledge-atlas ...
```

不好的写法：

```text
Please improve this page ...
```

原因：第一句话往往就决定了助手应该走“新建流程”“修 bug 流程”还是“高保真比对流程”。

### 建议 2：如果你已经知道目标目录名，就直接写出来

好的写法：

```text
Use $repo-tool-page-builder to create the tool under tools/chronicles-history-map ...
```

不好的写法：

```text
Please add another tool page ...
```

原因：明确目录可以减少仓库接入时的歧义。

### 建议 3：当高保真很重要时，要明确说出来

好的写法：

```text
Use $prototype-fidelity ... and treat the provided prototype HTML as the source of truth.
```

不好的写法：

```text
Make it prettier.
```

原因：“更好看一点”只会触发普通润色；“把原型当成唯一视觉标准”才会触发 fidelity-first 的工作方式。

### 建议 4：如果浏览器中的真实行为很重要，就明确要求做浏览器验证

好的写法：

```text
Use $repo-tool-polish to fix this modal bug and verify the flow in the browser.
```

原因：这会推动流程先复现、再修复、再验证，而不是只在代码里猜测问题。

### 建议 5：如果技术栈或部署约束不能变，就在提示词里写清楚

示例：

```text
Use $repo-tool-page-builder to create a pure HTML/CSS/JS tool page, keep all assets self-contained under tools/my-tool, and preserve GitHub Pages friendly relative paths.
```

## 推荐提示词模板

### 模板 A：新增工具页

```text
Use $repo-tool-page-builder to create a new tool under tools/<tool-name>/ from the prototype materials at <path>. Keep the implementation pure HTML/CSS/JS, add the landing-page card entry, and make sure the result is safe for GitHub Pages deployment.
```

### 模板 B：修已有页面 bug

```text
Use $repo-tool-polish to inspect the existing tool at tools/<tool-name>/, reproduce the reported issue, patch the smallest relevant HTML/CSS/JS surface, and verify the final behavior in the browser.
```

### 模板 C：高保真修正现有页面

```text
Use $prototype-fidelity to compare the implementation at tools/<tool-name>/ against the provided prototype HTML, screenshots, and design-language notes, then drive a one-to-one fidelity pass that prioritizes the largest layout and visual mismatches first.
```

### 模板 D：新页面 + 严格还原原型

```text
Use $repo-tool-page-builder and $prototype-fidelity to build a new tool under tools/<tool-name>/, wire it into the landing page, and treat the supplied prototype as the visual source of truth for a one-to-one restoration pass.
```

### 模板 E：已有页面修 bug + 进一步提升还原度

```text
Use $repo-tool-polish and $prototype-fidelity to fix the existing tool at tools/<tool-name>/, verify the reported browser behavior, and then compare the updated result against the prototype for a closer visual match.
```

## 常见误用场景

| 误用方式 | 更好的选择 |
|---|---|
| 用 `repo-tool-page-builder` 去修一个已经存在页面里的小 CSS 问题 | 用 `repo-tool-polish` |
| 用 `repo-tool-polish` 去从零新建一个完整工具页 | 用 `repo-tool-page-builder` |
| 页面整体已经和原型差很大，却只用 `repo-tool-polish` 去修局部问题 | 加上 `prototype-fidelity` |
| 一个纯功能 bug，没有明显视觉还原要求，却直接使用 `prototype-fidelity` | 用 `repo-tool-polish` |
| 用户真实要求是“严格按原型来”，但提示词只写“帮我美化一下” | 明确写“use `prototype-fidelity` and treat the prototype as the source of truth” |

## 默认选择规则

如果你一时拿不准，可以先按下面这个默认顺序判断：

1. 如果页面还不存在，先用 `repo-tool-page-builder`。
2. 如果页面已经存在，而且问题是局部的，先用 `repo-tool-polish`。
3. 如果用户明确在意一比一还原原型，再加上 `prototype-fidelity`。
