# Supabase 同步接入说明

## 当前接入范围

本仓库当前已经完成 4 个工具页的 Supabase 接入，策略分为两类：

- `tools/policy-codex/`
  使用结构化业务表同步文章、法典和法典条目
- `tools/map/`
  使用 `tool_documents` 单表快照同步地图主题、选中状态和自定义标注
- `tools/flora-knowledge-atlas/`
  使用 `tool_documents` 单表快照同步花卉记录、思维导图和图片快照
- `tools/chronicles-history-map/`
  使用 `tool_documents` 单表快照同步时间轴、事件和图片档案

当前共享接入层文件：

- `D:/code/kaogong/ditu/scripts/supabase-config.js`
- `D:/code/kaogong/ditu/scripts/supabase-browser.js`
- `D:/code/kaogong/ditu/scripts/vendor-supabase.js`
- `D:/code/kaogong/ditu/supabase/index.html`

数据库脚本：

- `D:/code/kaogong/ditu/supabase/policy-codex-schema.sql`
- `D:/code/kaogong/ditu/supabase/tool-documents-schema.sql`

## 配置注入方式

仓库默认没有写死 Supabase URL 和 anon key。当前支持 3 种注入方式，优先级从高到低如下：

1. 浏览器 `localStorage`
2. 页面级全局变量 `window.__DITU_SUPABASE_CONFIG__`
3. `scripts/supabase-config.js` 中的 `FILE_DEFAULTS`

如果你不想手动打开控制台，当前仓库还提供了一个同源配置页：

- `http://127.0.0.1:4173/supabase/index.html`

### 方式 1：浏览器 `localStorage`

适合本地临时联调，不需要改仓库文件：

```js
localStorage.setItem("ditu-supabase-url", "https://your-project.supabase.co");
localStorage.setItem("ditu-supabase-anon-key", "your-anon-key");
```

清除本地覆盖值：

```js
localStorage.removeItem("ditu-supabase-url");
localStorage.removeItem("ditu-supabase-anon-key");
```

### 方式 2：页面级全局变量

适合在 GitHub Pages、反向代理页或你自己的入口 HTML 里注入，而不直接提交密钥到仓库：

```html
<script>
  window.__DITU_SUPABASE_CONFIG__ = {
    url: "https://your-project.supabase.co",
    anonKey: "your-anon-key"
  };
</script>
```

这段脚本需要放在工具页引用 `app.js` 之前。

### 方式 3：直接编辑配置文件

如果是你自己的私有部署，也可以直接修改：

- `D:/code/kaogong/ditu/scripts/supabase-config.js`

把下面的空值改成实际配置：

```js
const FILE_DEFAULTS = {
  url: "",
  anonKey: ""
};
```

## 数据结构

### 1. `policy-codex` 结构化表

`policy-codex` 使用 3 张表：

- `policy_articles`
- `policy_codices`
- `policy_codex_entries`

设计目标：

- 所有数据都用 `owner_id` 绑定 Supabase 用户
- 法典和文章可按 `updated_at` 排序
- 法典条目通过 `codex_id + sort_order` 维持顺序
- 通过 RLS 限制用户只能读写自己的数据

对应 SQL：

- `D:/code/kaogong/ditu/supabase/policy-codex-schema.sql`

### 2. 其余工具的快照表

`map`、`flora`、`chronicles` 当前都使用：

- `tool_documents`

表设计特点：

- `owner_id + tool_key` 唯一定位一份工具文档
- `payload` 直接保存该工具的业务快照
- 适合纯前端静态页先快速实现跨设备同步

对应 SQL：

- `D:/code/kaogong/ditu/supabase/tool-documents-schema.sql`

## 前端同步行为

### 未配置 Supabase

- 页面保持本地模式
- 继续使用原有 `localStorage` / `IndexedDB`
- 所有同步按钮保留，但只显示“未配置 Supabase”的提示

### 已配置但未登录

- 顶部同步区显示“可连接云同步”
- 点击后通过 Supabase Email OTP 发送登录链接

### 已登录

- 页面启动时先拉取云端数据
- 如果云端已有内容，以云端为准回填本地缓存
- 如果云端为空且本地已有真实缓存，则自动迁移本地数据到云端
- 如果云端为空且本地没有真实缓存，则保持空库，等待后续编辑再上传

### 关于演示数据的处理

`flora` 和 `chronicles` 都带有本地演示内容，但当前同步逻辑已经额外处理：

- 只有检测到真实本地缓存时，才会在首次登录空云端时执行迁移
- 不会因为页面自带演示种子而把默认演示内容自动推上云端

## 图片处理方式

### `flora-knowledge-atlas`

- 页面内部图片仍保存在浏览器本地 `IndexedDB`
- 云同步时，会把图片记录一起打包进 `tool_documents.payload`
- 从云端恢复时，会先重写本地 `IndexedDB`，再恢复界面状态

### `chronicles-history-map`

- 图片同样继续保存在本地 `IndexedDB`
- 云同步时把图片记录和事件、时间轴一起写入 `tool_documents.payload`
- 从云端恢复时，会清空并重建本地图片库

### 后续可演进方向

如果图片越来越多，建议后续改成：

- 图片上传到 Supabase Storage
- 业务数据中只保留 `path / mimeType / width / height / url`

这样可以避免 `payload` 越来越大。

## 本轮本地验证结果

在 2026-07-29 这轮改造中，已经完成过以下本地验证：

- `node --check scripts/supabase-config.js`
- `node --check scripts/supabase-browser.js`
- `node --check tools/policy-codex/app.js`
- `node --check tools/map/app.js`
- `node --check tools/flora-knowledge-atlas/app.js`
- `node --check tools/chronicles-history-map/app.js`

并且已用本地静态服务做过页面级冒烟检查：

- `tools/policy-codex/index.html`
- `tools/map/index.html`
- `tools/flora-knowledge-atlas/index.html`
- `tools/chronicles-history-map/index.html`

当前可确认：

- 页面本地模式能正常加载
- 顶部同步 UI 已接入
- 浏览器控制台未发现新的同步接入报错

当前仍未完成的，是依赖真实 Supabase 项目的端到端联调。

## 上线前需要你补的外部条件

在真实跨设备同步生效前，还需要：

1. 创建并配置 Supabase 项目
2. 开启 Email OTP 登录
3. 执行两份 SQL 脚本
4. 把 Pages 域名加入 Supabase Auth Redirect URLs
5. 提供可用的 `url` 和 `anonKey`

## 还未完成的真实联调项

由于仓库里当前没有真实 Supabase 项目配置，本轮还无法在本地完成下面这些最终验证：

1. 邮箱 OTP 登录是否成功
2. 首次登录时空云端迁移是否符合预期
3. 编辑后是否成功写入 Supabase
4. 页面刷新后是否正确从云端恢复
5. 不同设备访问时是否拿到同一份数据

这部分需要在拿到真实 Supabase 项目后再做最终联调和修复。
