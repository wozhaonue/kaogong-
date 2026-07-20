const STORAGE_KEYS = {
  articles: "policy-codex-articles-v1",
  codices: "policy-codex-codices-v1",
  ui: "policy-codex-ui-v1"
};

const ARTICLE_CATEGORIES = ["重大会议", "讲话"];

const demoArticles = [
  {
    id: crypto.randomUUID(),
    pinned: true,
    category: "重大会议",
    title: "中央全面依法治国工作会议学习纲要",
    date: "2026-05-18",
    source: "新华社",
    tags: ["依法治国", "治理现代化", "会议精神"],
    markdown: `# 会议要点\n\n围绕法治中国建设的总体目标，会议强调了以下几点：\n\n- 坚持党的领导与法治建设统一\n- 推进重点领域立法\n- 完善法治实施监督体系\n\n> 法治建设既要立足当前，也要面向长远。\n\n## 学习摘录\n\n会议指出，法治体系建设要与国家治理现代化同频共振，推动制度优势更好转化为治理效能。`,
    updatedAt: "2026-07-20T09:00:00.000Z"
  },
  {
    id: crypto.randomUUID(),
    pinned: false,
    category: "讲话",
    title: "关于青年干部法治思维培养的重要讲话摘录",
    date: "2026-03-08",
    source: "人民日报",
    tags: ["青年干部", "法治思维", "讲话"],
    markdown: `# 核心观点\n\n青年干部要把依法办事作为履职的基本功，把制度意识、程序意识、底线意识贯穿到具体工作中。\n\n## 记忆框架\n\n1. 先立规则，再谈执行\n2. 先守程序，再求效率\n3. 先明权责，再抓落实\n\n[延伸阅读](https://www.people.com.cn/)`,
    updatedAt: "2026-07-18T15:20:00.000Z"
  }
];

const demoCodices = [
  {
    id: crypto.randomUUID(),
    title: "中华人民共和国宪法摘编",
    summary: "聚焦宪法总纲、公民基本权利与国家机构部分的重点条目，便于日常背诵与时政积累。",
    date: "2018-03-11",
    source: "全国人民代表大会",
    tags: ["宪法", "国家制度", "公民权利"],
    updatedAt: "2026-07-19T10:30:00.000Z",
    entries: [
      {
        id: crypto.randomUUID(),
        number: "序 1",
        title: "国家根本制度",
        body: "中华人民共和国是工人阶级领导的、以工农联盟为基础的人民民主专政的社会主义国家。社会主义制度是中华人民共和国的根本制度。",
        notes: "记忆时重点对照“根本制度”“最本质特征”相关提法，可与党的领导表述一并整理。",
        updatedAt: "2026-07-16T08:00:00.000Z"
      },
      {
        id: crypto.randomUUID(),
        number: "第 5 条",
        title: "法治统一原则",
        body: "中华人民共和国实行依法治国，建设社会主义法治国家。国家维护社会主义法制的统一和尊严。",
        notes: "可与“全面依法治国”的会议讲话一起对照背诵，形成制度+实践双维度积累。",
        updatedAt: "2026-07-17T08:20:00.000Z"
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "中华人民共和国刑法学习卡",
    summary: "围绕总则与若干常考罪名整理的平铺条目，用于快速浏览法条与解读。",
    date: "2023-12-29",
    source: "全国人民代表大会常务委员会",
    tags: ["刑法", "总则", "罪名整理"],
    updatedAt: "2026-07-17T14:40:00.000Z",
    entries: [
      {
        id: crypto.randomUUID(),
        number: "第 13 条",
        title: "犯罪概念",
        body: "一切危害国家主权、领土完整和安全，分裂国家、颠覆人民民主专政的政权和推翻社会主义制度，破坏社会秩序和经济秩序，侵犯国有财产或者劳动群众集体所有的财产，侵犯公民私人所有的财产，侵犯公民的人身权利、民主权利和其他权利，以及其他危害社会的行为，依照法律应当受刑罚处罚的，都是犯罪。",
        notes: "条文较长，复习时建议拆成“危害国家安全 / 社会秩序 / 财产 / 人身民主权利 / 其他危害社会行为”五组。",
        updatedAt: "2026-07-18T11:20:00.000Z"
      },
      {
        id: crypto.randomUUID(),
        number: "第 20 条",
        title: "正当防卫",
        body: "为了使国家、公共利益、本人或者他人的人身、财产和其他权利免受正在进行的不法侵害，而采取的制止不法侵害的行为，对不法侵害人造成损害的，属于正当防卫，不负刑事责任。",
        notes: "可结合典型案例记忆“正在进行的不法侵害”“明显超过必要限度”等关键词。",
        updatedAt: "2026-07-18T11:55:00.000Z"
      },
      {
        id: crypto.randomUUID(),
        number: "第 232 条",
        title: "故意杀人罪",
        body: "故意杀人的，处死刑、无期徒刑或者十年以上有期徒刑；情节较轻的，处三年以上十年以下有期徒刑。",
        notes: "整理罪名时建议同步记录法定刑区间，方便与其他暴力犯罪横向比较。",
        updatedAt: "2026-07-18T12:30:00.000Z"
      }
    ]
  }
];

const defaultUiState = {
  activeTab: "articles",
  selectedArticleId: "",
  selectedCodexId: "",
  codexOpen: false,
  articleQuery: "",
  globalQuery: "",
  codexQuery: "",
  codexSourceFilter: "",
  codexTagFilter: "",
  codexView: "list",
  selectedEntryId: ""
};

const state = {
  articles: loadCollection(STORAGE_KEYS.articles, demoArticles),
  codices: loadCollection(STORAGE_KEYS.codices, demoCodices),
  ui: loadUiState()
};

bootstrapSelections();

const dom = {
  globalSearch: document.getElementById("global-search"),
  resetDemo: document.getElementById("reset-demo"),
  tabs: [...document.querySelectorAll("[data-tab-target]")],
  modules: [...document.querySelectorAll("[data-module]")],
  articleList: document.getElementById("article-list"),
  articleQuery: document.getElementById("article-query"),
  articleTitle: document.getElementById("article-title"),
  articleCategory: document.getElementById("article-category"),
  articleDate: document.getElementById("article-date"),
  articleSource: document.getElementById("article-source"),
  articleTags: document.getElementById("article-tags"),
  articleMarkdown: document.getElementById("article-markdown"),
  articlePreview: document.getElementById("article-preview"),
  articleSaveState: document.getElementById("article-save-state"),
  saveArticle: document.getElementById("save-article"),
  duplicateArticle: document.getElementById("duplicate-article"),
  deleteArticle: document.getElementById("delete-article"),
  newArticle: document.getElementById("new-article"),
  markdownButtons: [...document.querySelectorAll(".format-button")],
  codexGrid: document.getElementById("codex-grid"),
  codexDiscovery: document.getElementById("codex-discovery"),
  codexWorkspace: document.getElementById("codex-workspace"),
  codexBack: document.getElementById("codex-back"),
  codexFilterReset: document.getElementById("codex-filter-reset"),
  codexTitleHeading: document.getElementById("codex-title-heading"),
  codexOverviewCard: document.getElementById("codex-overview-card"),
  codexListView: document.getElementById("codex-list-view"),
  codexCardView: document.getElementById("codex-card-view"),
  codexQuery: document.getElementById("codex-query"),
  codexSourceFilter: document.getElementById("codex-source-filter"),
  codexTagFilter: document.getElementById("codex-tag-filter"),
  codexViewButtons: [...document.querySelectorAll("[data-codex-view]")],
  newCodex: document.getElementById("new-codex"),
  editCodex: document.getElementById("edit-codex"),
  newEntry: document.getElementById("new-entry"),
  codexModal: document.getElementById("codex-modal"),
  codexModalTitle: document.getElementById("codex-modal-title"),
  codexForm: document.getElementById("codex-form"),
  codexFormTitle: document.getElementById("codex-form-title"),
  codexFormSummary: document.getElementById("codex-form-summary"),
  codexFormDate: document.getElementById("codex-form-date"),
  codexFormSource: document.getElementById("codex-form-source"),
  codexFormTags: document.getElementById("codex-form-tags"),
  entryModal: document.getElementById("entry-modal"),
  entryModalTitle: document.getElementById("entry-modal-title"),
  entryForm: document.getElementById("entry-form"),
  entryFormNumber: document.getElementById("entry-form-number"),
  entryFormTitle: document.getElementById("entry-form-title"),
  entryFormBody: document.getElementById("entry-form-body"),
  entryFormNotes: document.getElementById("entry-form-notes"),
  confirmModal: document.getElementById("confirm-modal"),
  confirmForm: document.getElementById("confirm-form"),
  confirmModalTitle: document.getElementById("confirm-modal-title"),
  confirmModalMessage: document.getElementById("confirm-modal-message"),
  confirmSubmit: document.getElementById("confirm-submit"),
  toastStack: document.getElementById("toast-stack"),
  emptyStateTemplate: document.getElementById("empty-state-template")
};

const draftFlags = {
  articleDirty: false
};

const modalState = {
  codexEditingId: null,
  entryEditingId: null,
  confirmAction: null
};

bindEvents();
render();

function bindEvents() {
  dom.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.ui.activeTab = tab.dataset.tabTarget;
      persistUiState();
      render();
    });
  });

  dom.globalSearch.addEventListener("input", () => {
    state.ui.globalQuery = dom.globalSearch.value.trim();
    persistUiState();
    render();
  });

  dom.resetDemo.addEventListener("click", () => {
    openConfirmModal({
      title: "重置演示数据",
      message: "这会清空当前浏览器中的本地数据，并恢复默认演示内容。是否继续？",
      confirmLabel: "确认重置",
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEYS.articles);
        localStorage.removeItem(STORAGE_KEYS.codices);
        localStorage.removeItem(STORAGE_KEYS.ui);
        showToast({ title: "已重置", message: "演示数据已恢复，页面即将刷新。", tone: "info" });
        window.setTimeout(() => window.location.reload(), 420);
      }
    });
  });

  dom.articleQuery.addEventListener("input", () => {
    state.ui.articleQuery = dom.articleQuery.value.trim();
    persistUiState();
    renderArticleList();
  });

  dom.newArticle.addEventListener("click", createArticle);
  dom.saveArticle.addEventListener("click", saveCurrentArticle);
  dom.duplicateArticle.addEventListener("click", duplicateCurrentArticle);
  dom.deleteArticle.addEventListener("click", deleteCurrentArticle);

  ["input", "change"].forEach((eventName) => {
    dom.articleTitle.addEventListener(eventName, syncArticleFromForm);
    dom.articleCategory.addEventListener(eventName, syncArticleFromForm);
    dom.articleDate.addEventListener(eventName, syncArticleFromForm);
    dom.articleSource.addEventListener(eventName, syncArticleFromForm);
    dom.articleTags.addEventListener(eventName, syncArticleFromForm);
    dom.articleMarkdown.addEventListener(eventName, syncArticleFromForm);
  });

  dom.markdownButtons.forEach((button) => {
    button.addEventListener("click", () => applyMarkdownAction(button.dataset));
  });

  dom.codexQuery.addEventListener("input", () => {
    state.ui.codexQuery = dom.codexQuery.value.trim();
    persistUiState();
    renderCodexModule();
  });

  dom.codexSourceFilter.addEventListener("change", () => {
    state.ui.codexSourceFilter = dom.codexSourceFilter.value;
    persistUiState();
    renderCodexModule();
  });

  dom.codexTagFilter.addEventListener("change", () => {
    state.ui.codexTagFilter = dom.codexTagFilter.value;
    persistUiState();
    renderCodexModule();
  });

  dom.codexViewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.codexView = button.dataset.codexView;
      persistUiState();
      renderCodexWorkspace();
    });
  });

  dom.newCodex.addEventListener("click", () => openCodexModal());
  dom.codexBack.addEventListener("click", () => {
    state.ui.codexOpen = false;
    persistUiState();
    renderCodexModule();
  });
  dom.codexFilterReset.addEventListener("click", () => {
    state.ui.codexQuery = "";
    state.ui.codexSourceFilter = "";
    state.ui.codexTagFilter = "";
    persistUiState();
    renderCodexModule();
  });
  dom.editCodex.addEventListener("click", () => {
    const codex = getSelectedCodex();
    if (!codex) {
      return;
    }
    openCodexModal(codex.id);
  });
  dom.newEntry.addEventListener("click", () => openEntryModal());

  dom.codexForm.addEventListener("submit", handleCodexFormSubmit);
  dom.entryForm.addEventListener("submit", handleEntryFormSubmit);
  dom.confirmForm.addEventListener("submit", handleConfirmSubmit);
  dom.confirmModal.addEventListener("close", clearConfirmAction);
}

function render() {
  dom.globalSearch.value = state.ui.globalQuery;
  dom.tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tabTarget === state.ui.activeTab);
  });
  dom.modules.forEach((module) => {
    module.hidden = module.dataset.module !== state.ui.activeTab;
  });

  renderArticleModule();
  renderCodexModule();
}

function renderArticleModule() {
  renderArticleList();
  renderArticleEditor();
}

function renderArticleList() {
  dom.articleQuery.value = state.ui.articleQuery;
  const articles = filterArticles();
  dom.articleList.innerHTML = "";

  if (articles.length === 0) {
    dom.articleList.append(dom.emptyStateTemplate.content.cloneNode(true));
    return;
  }

  for (const article of articles) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `sidebar-card${article.id === state.ui.selectedArticleId ? " is-active" : ""}`;
    card.innerHTML = `
      <div class="sidebar-card-head">
        <span class="article-kind">${escapeHtml(article.category)}</span>
        <button class="icon-button article-pin-button${article.pinned ? " is-pinned" : ""}" type="button" data-action="toggle-pin" title="${article.pinned ? "取消置顶" : "置顶"}">
          <span class="material-symbols-outlined" aria-hidden="true">${article.pinned ? "keep" : "keep_off"}</span>
        </button>
      </div>
      <h3>${escapeHtml(article.title || "未命名文章")}</h3>
      <p>${escapeHtml(truncate(article.markdown.replace(/[#>*`\-\[\]\(\)!]/g, "").trim(), 96) || "暂无正文内容。")}</p>
      <div class="codex-meta-cluster">
        <span class="metric-chip">${formatDate(article.date) || "未设日期"}</span>
        <span class="metric-chip">${escapeHtml(article.source || "未设来源")}</span>
      </div>
    `;
    card.addEventListener("click", () => {
      state.ui.selectedArticleId = article.id;
      draftFlags.articleDirty = false;
      persistUiState();
      renderArticleEditor();
      renderArticleList();
    });
    card.querySelector('[data-action="toggle-pin"]').addEventListener("click", (event) => {
      event.stopPropagation();
      article.pinned = !article.pinned;
      article.updatedAt = new Date().toISOString();
      persistArticles();
      renderArticleList();
    });
    dom.articleList.append(card);
  }
}

function renderArticleEditor() {
  const article = getSelectedArticle();
  const hasArticle = Boolean(article);

  [
    dom.articleTitle,
    dom.articleCategory,
    dom.articleDate,
    dom.articleSource,
    dom.articleTags,
    dom.articleMarkdown,
    dom.duplicateArticle,
    dom.deleteArticle
  ].forEach((element) => {
    element.disabled = !hasArticle;
  });
  dom.saveArticle.disabled = !hasArticle || !draftFlags.articleDirty;

  if (!article) {
    dom.articleTitle.value = "";
    dom.articleCategory.value = ARTICLE_CATEGORIES[0];
    dom.articleDate.value = "";
    dom.articleSource.value = "";
    dom.articleTags.value = "";
    dom.articleMarkdown.value = "";
    dom.articlePreview.innerHTML = "";
    dom.articlePreview.append(dom.emptyStateTemplate.content.cloneNode(true));
    dom.articleSaveState.textContent = "无内容";
    return;
  }

  dom.articleTitle.value = article.title;
  dom.articleCategory.value = article.category;
  dom.articleDate.value = article.date || "";
  dom.articleSource.value = article.source || "";
  dom.articleTags.value = article.tags.join(", ");
  dom.articleMarkdown.value = article.markdown;
  dom.articlePreview.innerHTML = renderMarkdown(article.markdown);
  dom.articleSaveState.textContent = draftFlags.articleDirty ? "编辑中" : "已保存";
}

function renderCodexModule() {
  alignCodexSelectionToFilters();
  renderCodexFilters();
  renderCodexGrid();
  renderCodexWorkspace();
  const shouldShowWorkspace = Boolean(getSelectedCodex()) && state.ui.codexOpen;
  dom.codexDiscovery.hidden = shouldShowWorkspace;
  dom.codexWorkspace.hidden = !shouldShowWorkspace;
}

function renderCodexFilters() {
  dom.codexQuery.value = state.ui.codexQuery;
  const sources = [...new Set(state.codices.map((codex) => codex.source).filter(Boolean))];
  const tags = [...new Set(state.codices.flatMap((codex) => codex.tags || []))];

  fillSelect(dom.codexSourceFilter, sources, state.ui.codexSourceFilter, "全部来源");
  fillSelect(dom.codexTagFilter, tags, state.ui.codexTagFilter, "全部标签");
}

function renderCodexGrid() {
  const codices = filterCodices();
  dom.codexGrid.innerHTML = "";

  if (codices.length === 0) {
    dom.codexGrid.append(dom.emptyStateTemplate.content.cloneNode(true));
    return;
  }

  for (const codex of codices) {
    const card = document.createElement("article");
    card.className = `codex-card${codex.id === state.ui.selectedCodexId ? " is-active" : ""}`;
    card.innerHTML = `
      <button class="codex-card-cover" type="button">
        <span>${escapeHtml(codex.source || "Codex")}</span>
        <h3>${escapeHtml(codex.title)}</h3>
      </button>
      <div class="codex-card-body">
        <div class="codex-chip-row">
          ${codex.tags.slice(0, 3).map((tag) => `<span class="codex-chip">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <p>${escapeHtml(truncate(codex.summary, 120))}</p>
      </div>
      <div class="codex-card-footer">
        <span class="metric-chip">${codex.entries.length} 条条目</span>
        <span class="metric-chip">${formatDate(codex.date) || "未设日期"}</span>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.ui.selectedCodexId = codex.id;
      state.ui.selectedEntryId = codex.entries[0]?.id || "";
      state.ui.codexOpen = true;
      persistUiState();
      renderCodexModule();
    });
    dom.codexGrid.append(card);
  }
}

function renderCodexWorkspace() {
  const codex = getSelectedCodex();
  const hasCodex = Boolean(codex);

  dom.editCodex.disabled = !hasCodex;
  dom.newEntry.disabled = !hasCodex;

  if (!codex) {
    return;
  }

  dom.codexTitleHeading.textContent = codex.title;
  dom.codexOverviewCard.innerHTML = `
    <div>
      <p class="eyebrow">Overview</p>
      <h3 style="margin:0;font-family:'EB Garamond',serif;font-size:40px;font-weight:500;color:var(--forest-strong);">${escapeHtml(codex.title)}</h3>
      <p>${escapeHtml(codex.summary || "暂无摘要。")}</p>
    </div>
    <div class="codex-summary-grid">
      <div><span class="eyebrow">来源</span><strong>${escapeHtml(codex.source || "未设来源")}</strong></div>
      <div><span class="eyebrow">日期</span><strong>${formatDate(codex.date) || "未设日期"}</strong></div>
      <div><span class="eyebrow">条目数</span><strong>${codex.entries.length}</strong></div>
      <div><span class="eyebrow">标签</span><strong>${escapeHtml(codex.tags.join(" / ") || "未设标签")}</strong></div>
    </div>
  `;

  dom.codexViewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.codexView === state.ui.codexView);
  });

  dom.codexListView.hidden = state.ui.codexView !== "list";
  dom.codexCardView.hidden = state.ui.codexView !== "card";

  renderCodexListView(codex);
  renderCodexCardView(codex);
}

function renderCodexListView(codex) {
  dom.codexListView.innerHTML = "";

  if (codex.entries.length === 0) {
    dom.codexListView.append(dom.emptyStateTemplate.content.cloneNode(true));
    return;
  }

  codex.entries.forEach((entry, index) => {
    const wrapper = document.createElement("article");
    wrapper.className = "accordion-item";

    wrapper.innerHTML = `
      <div class="accordion-summary">
        <div class="accordion-index">${index + 1}</div>
        <div>
          <p class="eyebrow">${escapeHtml(entry.number)}</p>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(truncate(entry.body, 170))}</p>
        </div>
        <button class="icon-button accordion-toggle" type="button" title="悬停展开" tabindex="-1" aria-hidden="true">
          <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
        </button>
      </div>
      <div class="accordion-body">
        <div class="compact-note">${escapeHtml(entry.notes || "暂无解读备注。")}</div>
        <div class="codex-entry-actions">
          <button class="round-button" type="button" data-action="edit-entry">编辑条目</button>
          <button class="round-button" type="button" data-action="delete-entry">删除条目</button>
          <span class="metric-chip">更新于 ${formatDateTime(entry.updatedAt)}</span>
        </div>
      </div>
    `;

    wrapper.querySelector('[data-action="edit-entry"]').addEventListener("click", (event) => {
      event.stopPropagation();
      openEntryModal(entry.id);
    });
    wrapper.querySelector('[data-action="delete-entry"]').addEventListener("click", (event) => {
      event.stopPropagation();
      deleteEntry(entry.id);
    });

    dom.codexListView.append(wrapper);
  });
}

function renderCodexCardView(codex) {
  dom.codexCardView.innerHTML = "";

  if (codex.entries.length === 0) {
    dom.codexCardView.append(dom.emptyStateTemplate.content.cloneNode(true));
    return;
  }

  const index = getSelectedEntryIndex(codex);
  const entry = codex.entries[index];
  const previousDisabled = index <= 0;
  const nextDisabled = index >= codex.entries.length - 1;

  const shell = document.createElement("article");
  shell.className = "entry-card-shell";
  shell.innerHTML = `
    <div class="entry-card-cover">
      <div class="cover-card">
        <span>Classification</span>
        <strong>${escapeHtml(codex.tags[0] || "Policy Archive")}</strong>
      </div>
    </div>
    <div class="entry-card-content">
      <p class="eyebrow">${escapeHtml(entry.number)}</p>
      <h3>${escapeHtml(entry.title)}</h3>
      <div class="codex-chip-row">
        ${codex.tags.map((tag) => `<span class="codex-chip">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="entry-card-meta">
        <span class="metric-chip">${escapeHtml(codex.source || "未设来源")}</span>
        <span class="metric-chip">${formatDateTime(entry.updatedAt)}</span>
      </div>
      <p class="entry-body">${escapeHtml(entry.body)}</p>
      <div class="compact-note">${escapeHtml(entry.notes || "暂无解读备注。")}</div>
      <div class="entry-card-nav">
        <div>
          <button class="icon-button" type="button" data-nav="prev"${previousDisabled ? " disabled" : ""}>
            <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
          </button>
          <button class="icon-button" type="button" data-nav="next"${nextDisabled ? " disabled" : ""}>
            <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
          </button>
        </div>
        <div class="toolbar-group">
          <button class="round-button" type="button" data-action="edit-entry">编辑条目</button>
          <button class="round-button" type="button" data-action="delete-entry">删除条目</button>
          <span class="metric-chip">Entry ${index + 1} / ${codex.entries.length}</span>
        </div>
      </div>
    </div>
  `;

  shell.querySelector('[data-nav="prev"]').addEventListener("click", () => moveEntrySelection(codex, -1));
  shell.querySelector('[data-nav="next"]').addEventListener("click", () => moveEntrySelection(codex, 1));
  shell.querySelector('[data-action="edit-entry"]').addEventListener("click", () => openEntryModal(entry.id));
  shell.querySelector('[data-action="delete-entry"]').addEventListener("click", () => deleteEntry(entry.id));

  dom.codexCardView.append(shell);
}

function filterArticles() {
  const query = normalize(`${state.ui.articleQuery} ${state.ui.globalQuery}`);
  if (!query) {
    return [...state.articles].sort(sortArticles);
  }
  return state.articles
    .filter((article) => {
      const haystack = normalize([
        article.title,
        article.source,
        article.category,
        article.tags.join(" "),
        article.markdown
      ].join(" "));
      return haystack.includes(query);
    })
    .sort(sortArticles);
}

function filterCodices() {
  const query = normalize(`${state.ui.codexQuery} ${state.ui.globalQuery}`);
  return [...state.codices]
    .filter((codex) => {
      const matchesQuery = !query || normalize([
        codex.title,
        codex.source,
        codex.summary,
        codex.tags.join(" "),
        codex.entries.map((entry) => `${entry.number} ${entry.title} ${entry.body}`).join(" ")
      ].join(" ")).includes(query);
      const matchesSource = !state.ui.codexSourceFilter || codex.source === state.ui.codexSourceFilter;
      const matchesTag = !state.ui.codexTagFilter || codex.tags.includes(state.ui.codexTagFilter);
      return matchesQuery && matchesSource && matchesTag;
    })
    .sort(sortByUpdatedAt);
}

function createArticle() {
  const article = {
    id: crypto.randomUUID(),
    category: ARTICLE_CATEGORIES[0],
    title: "未命名文章",
    date: todayString(),
    source: "",
    tags: [],
    markdown: "# 新建文稿\n\n在这里记录重大会议精神、讲话摘录或法治学习笔记。",
    updatedAt: new Date().toISOString()
  };
  state.articles.unshift(article);
  state.ui.selectedArticleId = article.id;
  draftFlags.articleDirty = false;
  persistArticles();
  persistUiState();
  renderArticleModule();
  showToast({ title: "已新建文章", message: "新文章已加入列表，可继续编辑正文。", tone: "success" });
}

function syncArticleFromForm() {
  const article = getSelectedArticle();
  if (!article) {
    return;
  }

  article.title = dom.articleTitle.value.trim() || "未命名文章";
  article.category = dom.articleCategory.value;
  article.date = dom.articleDate.value;
  article.source = dom.articleSource.value.trim();
  article.tags = splitTags(dom.articleTags.value);
  article.markdown = dom.articleMarkdown.value;
  draftFlags.articleDirty = true;
  article.updatedAt = new Date().toISOString();
  persistArticles();
  dom.saveArticle.disabled = false;
  dom.articleSaveState.textContent = "编辑中";
  dom.articlePreview.innerHTML = renderMarkdown(article.markdown);
  renderArticleList();
}

function saveCurrentArticle() {
  const article = getSelectedArticle();
  if (!article) {
    return;
  }
  article.updatedAt = new Date().toISOString();
  draftFlags.articleDirty = false;
  persistArticles();
  renderArticleModule();
  showToast({ title: "文章已保存", message: `《${article.title}》已写入本地存储。`, tone: "success" });
}

function duplicateCurrentArticle() {
  const current = getSelectedArticle();
  if (!current) {
    return;
  }
  const duplicate = {
    ...structuredClone(current),
    id: crypto.randomUUID(),
    pinned: false,
    title: `${current.title}（副本）`,
    updatedAt: new Date().toISOString()
  };
  state.articles.unshift(duplicate);
  state.ui.selectedArticleId = duplicate.id;
  draftFlags.articleDirty = false;
  persistArticles();
  persistUiState();
  renderArticleModule();
  showToast({ title: "已复制文章", message: "已创建当前文章副本。", tone: "success" });
}

function deleteCurrentArticle() {
  const article = getSelectedArticle();
  if (!article) {
    return;
  }
  openConfirmModal({
    title: "删除文章",
    message: `确定删除文章“${article.title}”吗？此操作不可撤销。`,
    confirmLabel: "删除文章",
    onConfirm: () => {
      state.articles = state.articles.filter((item) => item.id !== article.id);
      bootstrapSelections();
      persistArticles();
      persistUiState();
      renderArticleModule();
      showToast({ title: "文章已删除", message: `《${article.title}》已从本地库移除。`, tone: "info" });
    }
  });
}

function openCodexModal(codexId = null) {
  modalState.codexEditingId = codexId;
  const codex = state.codices.find((item) => item.id === codexId);
  dom.codexModalTitle.textContent = codex ? "编辑法典" : "新建法典";
  dom.codexFormTitle.value = codex?.title || "";
  dom.codexFormSummary.value = codex?.summary || "";
  dom.codexFormDate.value = codex?.date || "";
  dom.codexFormSource.value = codex?.source || "";
  dom.codexFormTags.value = codex?.tags.join(", ") || "";
  dom.codexModal.showModal();
}

function handleCodexFormSubmit(event) {
  if (event.submitter?.value === "cancel") {
    return;
  }
  event.preventDefault();

  const payload = {
    title: dom.codexFormTitle.value.trim(),
    summary: dom.codexFormSummary.value.trim(),
    date: dom.codexFormDate.value,
    source: dom.codexFormSource.value.trim(),
    tags: splitTags(dom.codexFormTags.value),
    updatedAt: new Date().toISOString()
  };

  if (!payload.title) {
    dom.codexFormTitle.focus();
    showToast({ title: "缺少标题", message: "请先填写法典标题，再保存法典。", tone: "warning" });
    return;
  }

  const isEditing = Boolean(modalState.codexEditingId);
  if (modalState.codexEditingId) {
    const codex = state.codices.find((item) => item.id === modalState.codexEditingId);
    Object.assign(codex, payload);
  } else {
    state.codices.unshift({
      id: crypto.randomUUID(),
      entries: [],
      ...payload
    });
    state.ui.selectedCodexId = state.codices[0].id;
    state.ui.selectedEntryId = "";
  }

  persistCodices();
  persistUiState();
  dom.codexModal.close();
  renderCodexModule();
  showToast({
    title: isEditing ? "法典已更新" : "法典已创建",
    message: `《${payload.title}》已保存到本地法典库。`,
    tone: "success"
  });
}

function openEntryModal(entryId = null) {
  const codex = getSelectedCodex();
  if (!codex) {
    return;
  }

  modalState.entryEditingId = entryId;
  const entry = codex.entries.find((item) => item.id === entryId);
  dom.entryModalTitle.textContent = entry ? "编辑条目" : "新增条目";
  dom.entryFormNumber.value = entry?.number || `第 ${codex.entries.length + 1} 条`;
  dom.entryFormTitle.value = entry?.title || "";
  dom.entryFormBody.value = entry?.body || "";
  dom.entryFormNotes.value = entry?.notes || "";
  dom.entryModal.showModal();
}

function handleEntryFormSubmit(event) {
  if (event.submitter?.value === "cancel") {
    return;
  }
  event.preventDefault();

  const codex = getSelectedCodex();
  if (!codex) {
    return;
  }

  const payload = {
    number: dom.entryFormNumber.value.trim(),
    title: dom.entryFormTitle.value.trim(),
    body: dom.entryFormBody.value.trim(),
    notes: dom.entryFormNotes.value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (!payload.number || !payload.title || !payload.body) {
    showToast({ title: "条目信息不完整", message: "请填写条目编号、标题和正文后再保存。", tone: "warning" });
    return;
  }

  const isEditing = Boolean(modalState.entryEditingId);
  if (modalState.entryEditingId) {
    const entry = codex.entries.find((item) => item.id === modalState.entryEditingId);
    Object.assign(entry, payload);
    state.ui.selectedEntryId = entry.id;
  } else {
    const entry = { id: crypto.randomUUID(), ...payload };
    codex.entries.push(entry);
    state.ui.selectedEntryId = entry.id;
  }

  codex.updatedAt = new Date().toISOString();
  persistCodices();
  persistUiState();
  dom.entryModal.close();
  renderCodexWorkspace();
  renderCodexGrid();
  showToast({
    title: isEditing ? "条目已更新" : "条目已创建",
    message: `“${payload.title}”已写入当前法典。`,
    tone: "success"
  });
}

function deleteEntry(entryId) {
  const codex = getSelectedCodex();
  if (!codex) {
    return;
  }
  const entry = codex.entries.find((item) => item.id === entryId);
  openConfirmModal({
    title: "删除条目",
    message: `确定删除条目“${entry?.title || ""}”吗？此操作不可撤销。`,
    confirmLabel: "删除条目",
    onConfirm: () => {
      codex.entries = codex.entries.filter((item) => item.id !== entryId);
      codex.updatedAt = new Date().toISOString();
      state.ui.selectedEntryId = codex.entries[0]?.id || "";
      persistCodices();
      persistUiState();
      renderCodexWorkspace();
      renderCodexGrid();
      showToast({ title: "条目已删除", message: `“${entry?.title || "该条目"}”已移除。`, tone: "info" });
    }
  });
}

function moveEntrySelection(codex, delta) {
  const nextIndex = getSelectedEntryIndex(codex) + delta;
  if (nextIndex < 0 || nextIndex >= codex.entries.length) {
    return;
  }
  state.ui.selectedEntryId = codex.entries[nextIndex].id;
  persistUiState();
  renderCodexCardView(codex);
  renderCodexListView(codex);
}

function applyMarkdownAction(dataset) {
  const textarea = dom.articleMarkdown;
  if (textarea.disabled) {
    return;
  }
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end) || "文本";
  let nextValue = value;
  let nextSelectionStart = start;
  let nextSelectionEnd = end;

  if (dataset.mdWrap) {
    const wrap = dataset.mdWrap;
    nextValue = `${value.slice(0, start)}${wrap}${selected}${wrap}${value.slice(end)}`;
    nextSelectionStart = start + wrap.length;
    nextSelectionEnd = nextSelectionStart + selected.length;
  } else if (dataset.mdPrefix) {
    const prefix = dataset.mdPrefix;
    const lines = (selected || "列表项").split("\n").map((line) => `${prefix}${line}`);
    nextValue = `${value.slice(0, start)}${lines.join("\n")}${value.slice(end)}`;
    nextSelectionStart = start;
    nextSelectionEnd = start + lines.join("\n").length;
  } else if (dataset.mdLink) {
    const snippet = `[${selected}](https://example.com)`;
    nextValue = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    nextSelectionStart = start + 1;
    nextSelectionEnd = start + 1 + selected.length;
  } else if (dataset.mdImage) {
    const snippet = `![图片说明](https://example.com/image.jpg)`;
    nextValue = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    nextSelectionStart = start + 2;
    nextSelectionEnd = start + 6;
  }

  textarea.value = nextValue;
  textarea.focus();
  textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
  syncArticleFromForm();
}

function getSelectedArticle() {
  return state.articles.find((article) => article.id === state.ui.selectedArticleId) || null;
}

function getSelectedCodex() {
  return state.codices.find((codex) => codex.id === state.ui.selectedCodexId) || null;
}

function getSelectedEntryIndex(codex) {
  const index = codex.entries.findIndex((entry) => entry.id === state.ui.selectedEntryId);
  if (index >= 0) {
    return index;
  }
  return 0;
}

function bootstrapSelections() {
  if (!state.ui.selectedArticleId || !state.articles.some((item) => item.id === state.ui.selectedArticleId)) {
    state.ui.selectedArticleId = state.articles[0]?.id || "";
  }
  if (!state.ui.selectedCodexId || !state.codices.some((item) => item.id === state.ui.selectedCodexId)) {
    state.ui.selectedCodexId = state.codices[0]?.id || "";
  }
  const selectedCodex = state.codices.find((item) => item.id === state.ui.selectedCodexId);
  if (!state.ui.selectedEntryId || !selectedCodex?.entries.some((item) => item.id === state.ui.selectedEntryId)) {
    state.ui.selectedEntryId = selectedCodex?.entries[0]?.id || "";
  }
  if (typeof state.ui.codexOpen !== "boolean") {
    state.ui.codexOpen = false;
  }
}

function openConfirmModal({ title, message, confirmLabel = "确认", onConfirm }) {
  modalState.confirmAction = typeof onConfirm === "function" ? onConfirm : null;
  dom.confirmModalTitle.textContent = title || "确认操作";
  dom.confirmModalMessage.textContent = message || "";
  dom.confirmSubmit.textContent = confirmLabel;
  dom.confirmModal.showModal();
}

function handleConfirmSubmit(event) {
  event.preventDefault();
  if (event.submitter?.value === "cancel") {
    closeConfirmModal();
    return;
  }
  const action = modalState.confirmAction;
  closeConfirmModal();
  if (typeof action === "function") {
    action();
  }
}

function closeConfirmModal() {
  if (dom.confirmModal.open) {
    dom.confirmModal.close();
  }
}

function clearConfirmAction() {
  modalState.confirmAction = null;
}

function showToast({ title, message, tone = "success", duration = 2600 }) {
  const toast = document.createElement("article");
  toast.className = "toast";
  toast.dataset.tone = tone;
  toast.innerHTML = `
    <div class="toast-icon">
      <span class="material-symbols-outlined" aria-hidden="true">${getToastIcon(tone)}</span>
    </div>
    <div class="toast-copy">
      <p class="toast-title">${escapeHtml(title || "提示")}</p>
      <p class="toast-message">${escapeHtml(message || "")}</p>
    </div>
    <button class="icon-button toast-close" type="button" aria-label="关闭提示">
      <span class="material-symbols-outlined" aria-hidden="true">close</span>
    </button>
  `;
  const removeToast = () => {
    if (toast.isConnected) {
      toast.remove();
    }
  };
  toast.querySelector(".toast-close").addEventListener("click", removeToast);
  dom.toastStack.append(toast);
  window.setTimeout(removeToast, duration);
}

function getToastIcon(tone) {
  if (tone === "warning") {
    return "warning";
  }
  if (tone === "info") {
    return "info";
  }
  return "check_circle";
}

function alignCodexSelectionToFilters() {
  const filtered = filterCodices();
  if (filtered.length === 0) {
    state.ui.selectedCodexId = "";
    state.ui.selectedEntryId = "";
    persistUiState();
    return;
  }

  if (!filtered.some((codex) => codex.id === state.ui.selectedCodexId)) {
    state.ui.selectedCodexId = filtered[0].id;
    state.ui.selectedEntryId = filtered[0].entries[0]?.id || "";
    persistUiState();
  }
}

function loadCollection(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return structuredClone(fallback);
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function loadUiState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ui);
    return raw ? { ...defaultUiState, ...JSON.parse(raw) } : structuredClone(defaultUiState);
  } catch {
    return structuredClone(defaultUiState);
  }
}

function persistArticles() {
  localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(state.articles));
}

function persistCodices() {
  localStorage.setItem(STORAGE_KEYS.codices, JSON.stringify(state.codices));
}

function persistUiState() {
  localStorage.setItem(STORAGE_KEYS.ui, JSON.stringify(state.ui));
}

function renderMarkdown(markdown) {
  const escaped = escapeHtml(markdown);
  const lines = escaped.split(/\r?\n/);
  const chunks = [];
  let inList = false;
  let listTag = null;
  let inCode = false;
  let codeBuffer = [];

  const closeList = () => {
    if (inList) {
      chunks.push(`</${listTag}>`);
      inList = false;
      listTag = null;
    }
  };

  const closeCode = () => {
    if (inCode) {
      chunks.push(`<pre><code>${codeBuffer.join("\n")}</code></pre>`);
      inCode = false;
      codeBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      closeList();
      if (inCode) {
        closeCode();
      } else {
        inCode = true;
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (!trimmed) {
      closeList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      chunks.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      closeList();
      chunks.push(`<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      if (!inList || listTag !== "ul") {
        closeList();
        listTag = "ul";
        chunks.push("<ul>");
        inList = true;
      }
      chunks.push(`<li>${inlineMarkdown(unorderedMatch[1])}</li>`);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (!inList || listTag !== "ol") {
        closeList();
        listTag = "ol";
        chunks.push("<ol>");
        inList = true;
      }
      chunks.push(`<li>${inlineMarkdown(orderedMatch[1])}</li>`);
      continue;
    }

    closeList();
    chunks.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }

  closeList();
  closeCode();
  return chunks.join("");
}

function inlineMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function splitTags(raw) {
  return raw
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fillSelect(select, values, selectedValue, placeholder) {
  const current = new Set(values);
  select.innerHTML = `<option value="">${placeholder}</option>${[...current]
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("")}`;
  select.value = current.has(selectedValue) ? selectedValue : "";
}

function sortByUpdatedAt(a, b) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function sortArticles(a, b) {
  if (Boolean(a.pinned) !== Boolean(b.pinned)) {
    return a.pinned ? -1 : 1;
  }
  return sortByUpdatedAt(a, b);
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function truncate(value, length) {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
