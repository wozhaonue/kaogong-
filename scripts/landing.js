const tools = [
  {
    title: "政策法典库",
    description: "Scholar's Nook 风格的法律法典与时政积累工作台，支持法典条目管理、双视图检索与 Markdown 文稿编辑。",
    tag: "法治 / 时政",
    href: "./tools/policy-codex/index.html",
    status: "已上线",
    chips: ["法典管理", "Markdown 编辑", "本地持久化"]
  },
  {
    title: "中国地图图谱",
    description: "真实 GIS 风格中国地图与自定义地理标注工具，已作为独立子页接入当前门户结构。",
    tag: "地图 / GIS",
    href: "./tools/map/index.html",
    status: "已上线",
    chips: ["真实地形", "城市检索", "自定义标注"]
  },
  {
    title: "色板实验室",
    description: "一个示例纯前端工具页，用于承接后续的配色、样式或组件类实验工具。",
    tag: "设计工具",
    href: "./tools/color-lab/index.html",
    status: "预留",
    chips: ["占位页", "纯静态", "可扩展"]
  },
  {
    title: "情报看板",
    description: "一个示例工具入口页，用于承载信息汇总、导航型页面或其他轻量可视化工具。",
    tag: "信息工具",
    href: "./tools/insight-board/index.html",
    status: "预留",
    chips: ["工具入口", "卡片跳转", "部署友好"]
  }
];

const toolGrid = document.getElementById("tool-grid");

toolGrid.innerHTML = tools
  .map(
    (tool) => `
      <a class="tool-card" href="${tool.href}">
        <div class="tool-card-head">
          <div>
            <h3>${tool.title}</h3>
          </div>
          <span class="tool-badge">${tool.status}</span>
        </div>
        <p>${tool.description}</p>
        <div class="tool-meta">
          <span class="tool-chip">${tool.tag}</span>
          ${tool.chips.map((chip) => `<span class="tool-chip">${chip}</span>`).join("")}
        </div>
        <span class="tool-link">进入工具 <span aria-hidden="true">→</span></span>
      </a>
    `
  )
  .join("");
