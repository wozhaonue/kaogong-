# ditu

一个以静态文件为主的前端工具站点，首页作为工具入口，`tools/` 目录下挂载各个独立子页面。当前包含中国 GIS 地图工具，以及两个示例工具页。

## 项目结构

```text
.
├─ index.html                  首页入口
├─ 404.html                    Pages 404 重定向页
├─ server.mjs                  本地静态文件服务器
├─ styles/
│  └─ landing.css              首页样式
├─ scripts/
│  ├─ landing.js               首页工具卡片渲染
│  ├─ copy-maplibre.mjs        复制 MapLibre 前端资源
│  └─ preprocess-data.mjs      预处理地图数据
├─ tools/
│  ├─ map/                     中国 GIS 地图工具
│  ├─ color-lab/               示例工具页
│  └─ insight-board/           示例工具页
└─ .github/workflows/
   └─ deploy-pages.yml         GitHub Pages 自动部署
```

## 运行环境

- Node.js 18 及以上
- npm

## 本地启动

首次拉取仓库后，先安装依赖：

```bash
npm install
```

如果 `tools/map/vendor/` 下缺少 `maplibre-gl.js` 或 `maplibre-gl.css`，先执行：

```bash
npm run prepare:vendor
```

如果需要重新生成地图相关数据，执行：

```bash
npm run prepare:data
```

启动本地静态服务器：

```bash
npm run start
```

默认访问地址：

```text
http://127.0.0.1:4173
```

## 为什么本地要用服务器启动

这个项目虽然是静态站点，但地图页面会通过 `fetch()` 请求 `json`、`geojson`、`webp` 等静态资源，同时页面还使用了 ES Module 脚本。直接双击 `index.html` 以 `file://` 协议打开时，浏览器通常会限制这些资源请求；通过 `node server.mjs` 提供本地 HTTP 服务后，浏览器就能按正常网站的方式加载页面、脚本和数据文件。

## npm scripts

`package.json` 中定义了这些常用命令：

- `npm run start`
  启动本地静态服务器，对应 `node server.mjs`
- `npm run prepare:vendor`
  复制 MapLibre 前端依赖到 `tools/map/vendor/`
- `npm run prepare:data`
  预处理地图数据
- `npm run build:data`
  与 `prepare:data` 等价，便于单独执行数据构建

## GitHub Pages 部署

仓库已经包含 GitHub Pages 工作流：

- `.github/workflows/deploy-pages.yml`

工作流触发条件：

- push 到 `main` 分支
- 在 GitHub Actions 页面手动点击 `Run workflow`

工作流部署方式：

1. 在 Actions 运行环境中临时创建 `dist/`
2. 复制 `index.html`、`404.html`、`.nojekyll`、`styles/`、`scripts/`、`tools/` 到 `dist/`
3. 将 `dist/` 作为 Pages artifact 上传
4. 发布到 GitHub Pages

注意：`dist/` 只是 CI 运行时生成的临时目录，不会自动提交回仓库，因此你在 GitHub 仓库文件列表里看不到它是正常的。

## 首次发布到 GitHub Pages

1. 确保仓库默认分支是 `main`
2. 打开仓库 `Settings > Actions > General`
3. 确认 Actions 允许执行
4. 打开 `Settings > Pages`
5. 将 `Source` 设为 `GitHub Actions`
6. 推送一次新提交到 `main`

例如：

```bash
git add .
git commit -m "docs: update README"
git push origin main
```

如果只是为了触发部署，也可以推一个空提交：

```bash
git commit --allow-empty -m "trigger pages deploy"
git push origin main
```

## 如何判断工作流是否正常出现

进入仓库的 `Actions` 页面后，正常情况下应看到：

- 左侧工作流列表中有 `Deploy GitHub Pages`
- 点进去后，运行记录标题通常是：
  - `Deploy GitHub Pages #数字`
  - 或某次由 push 触发的运行记录
- 运行状态会显示为 `Queued`、`In progress`、`Completed`
- 如果成功，状态会是绿色对勾
- 如果失败，状态会显示红色失败标记，并可进入日志页面查看报错

如果工作流文件存在，但 Actions 页没有任何运行记录，通常说明：

- 仓库 Actions 未启用
- `main` 分支还没有触发新的 push
- Pages Source 还没设置为 `GitHub Actions`
- 首次运行被 GitHub 拦截，需要手动启用

## 当前维护建议

- 修改地图资源或首页入口后，本地先用 `npm run start` 验证
- 修改 Pages 工作流后，推送到 `main` 并在 Actions 页面确认新的运行记录
- 如果页面资源更新后线上未生效，先检查 Actions 是否成功，再检查浏览器缓存
