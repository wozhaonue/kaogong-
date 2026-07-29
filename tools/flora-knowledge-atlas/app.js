import { createSupabaseBrowserService } from "../../scripts/supabase-browser.js";

const STORAGE_KEYS = {
  flowers: "flora-atlas-flowers-v1",
  maps: "flora-atlas-maps-v2",
  legacyMap: "flora-atlas-map-v1",
  ui: "flora-atlas-ui-v1"
};

const TOOL_KEY = "flora-knowledge-atlas";

const IMAGE_DB = {
  name: "flora-atlas-assets-v1",
  version: 1,
  store: "flowerImages"
};

const ROOT_ID = "root-node";
const MODAL_MS = 220;
const DEFAULT_VIEWPORT = Object.freeze({ scale: 1, x: 140, y: 250 });

const demoFlowers = [
  {
    id: "flower-peony",
    name: "牡丹",
    scientificName: "Paeonia suffruticosa",
    characteristics: "花型丰盈，瓣层舒展，盛放时有明显的体量感与古典华贵气质。",
    symbolism: "富贵、典雅、兴盛",
    imageId: "",
    imageName: "",
    imageMimeType: "",
    createdAt: "2026-07-10T08:00:00.000Z",
    updatedAt: "2026-07-10T08:00:00.000Z"
  },
  {
    id: "flower-lotus",
    name: "荷花",
    scientificName: "Nelumbo nucifera",
    characteristics: "花瓣舒朗，叶片圆阔，常与夏季水面景观共同出现，形态清润安静。",
    symbolism: "清正、洁净、静定",
    imageId: "",
    imageName: "",
    imageMimeType: "",
    createdAt: "2026-07-11T08:00:00.000Z",
    updatedAt: "2026-07-11T08:00:00.000Z"
  },
  {
    id: "flower-plum",
    name: "梅花",
    scientificName: "Prunus mume",
    characteristics: "枝干劲挺，花朵小而精致，冬末初春开放，气质清寒却不失生机。",
    symbolism: "坚韧、傲骨、清雅",
    imageId: "",
    imageName: "",
    imageMimeType: "",
    createdAt: "2026-07-12T08:00:00.000Z",
    updatedAt: "2026-07-12T08:00:00.000Z"
  },
  {
    id: "flower-osmanthus",
    name: "桂花",
    scientificName: "Osmanthus fragrans",
    characteristics: "花序细密，香气明显，常用于秋季庭院与文学意象的记忆整理。",
    symbolism: "高洁、收获、团圆",
    imageId: "",
    imageName: "",
    imageMimeType: "",
    createdAt: "2026-07-13T08:00:00.000Z",
    updatedAt: "2026-07-13T08:00:00.000Z"
  }
];

const demoMaps = [
  createMapRecord("map-seasons", "四时花卉", {
    id: ROOT_ID,
    type: "root",
    label: "花卉总图谱",
    children: [
      {
        id: "branch-spring",
        type: "text",
        label: "春季意象",
        children: [
          { id: "node-plum", type: "flowerRef", label: "梅花", flowerId: "flower-plum", children: [] },
          { id: "node-peony", type: "flowerRef", label: "牡丹", flowerId: "flower-peony", children: [] }
        ]
      },
      {
        id: "branch-summer",
        type: "text",
        label: "夏季水景",
        children: [{ id: "node-lotus", type: "flowerRef", label: "荷花", flowerId: "flower-lotus", children: [] }]
      }
    ]
  }),
  createMapRecord("map-symbols", "象征意义", {
    id: ROOT_ID,
    type: "root",
    label: "花卉总图谱",
    children: [
      {
        id: "branch-character",
        type: "text",
        label: "品格寄托",
        children: [
          { id: "node-plum-symbol", type: "flowerRef", label: "梅花", flowerId: "flower-plum", children: [] },
          { id: "node-lotus-symbol", type: "flowerRef", label: "荷花", flowerId: "flower-lotus", children: [] }
        ]
      },
      {
        id: "branch-fragrance",
        type: "text",
        label: "气味记忆",
        children: [{ id: "node-osmanthus", type: "flowerRef", label: "桂花", flowerId: "flower-osmanthus", children: [] }]
      }
    ]
  })
];

const defaultUi = {
  activeTab: "list",
  search: "",
  sort: "name",
  listViewMode: "grid",
  mapSearch: "",
  selectedMapId: "",
  isMapFullscreen: false,
  mapViewports: {}
};

const state = {
  flowers: loadCollection(STORAGE_KEYS.flowers, demoFlowers),
  maps: loadMaps(),
  ui: loadUiState(),
  editingFlowerId: "",
  imageDraft: null,
  branchParentId: ROOT_ID,
  confirmAction: null,
  imageCache: {},
  deletingMapId: ""
};

const runtime = {
  modalTimers: new Map(),
  openDialogs: new Set(),
  filePickerActive: false,
  tooltipFlowerId: "",
  galleryDrag: null,
  viewportDrag: null,
  openMapMenuId: "",
  toastTimers: new WeakMap()
};

const dom = {
  syncCluster: document.getElementById("sync-cluster"),
  syncTitle: document.getElementById("sync-title"),
  syncMeta: document.getElementById("sync-meta"),
  syncSignIn: document.getElementById("sync-sign-in"),
  syncSignOut: document.getElementById("sync-sign-out"),
  authModal: document.getElementById("auth-modal"),
  authForm: document.getElementById("auth-form"),
  authEmail: document.getElementById("auth-email"),
  tabs: Array.from(document.querySelectorAll("[data-tab]")),
  panels: Array.from(document.querySelectorAll("[data-panel]")),
  flowerSearch: document.getElementById("flower-search"),
  flowerSort: document.getElementById("flower-sort"),
  flowerGrid: document.getElementById("flower-grid"),
  flowerGallery: document.getElementById("flower-gallery"),
  flowerGalleryScroll: document.getElementById("flower-gallery-scroll"),
  flowerGalleryTrack: document.getElementById("flower-gallery-track"),
  listViewButtons: Array.from(document.querySelectorAll("[data-list-view]")),
  mapList: document.getElementById("map-list"),
  mapSearch: document.getElementById("map-search"),
  newMapButton: document.getElementById("new-map-button"),
  deleteMapButton: document.getElementById("delete-map-button"),
  presentMapButton: document.getElementById("present-map-button"),
  resetMapView: document.getElementById("reset-map-view"),
  activeMapTitle: document.getElementById("active-map-title"),
  statFlowers: document.getElementById("stat-flowers"),
  statNodes: document.getElementById("stat-nodes"),
  zoomBadge: document.getElementById("zoom-badge"),
  viewport: document.getElementById("mindmap-viewport"),
  svg: document.getElementById("mindmap-svg"),
  canvas: document.getElementById("mindmap-canvas"),
  fullscreenShell: document.getElementById("map-fullscreen"),
  fullscreenTitle: document.getElementById("fullscreen-map-title"),
  closeFullscreenMap: document.getElementById("close-fullscreen-map"),
  fullscreenViewport: document.getElementById("fullscreen-mindmap-viewport"),
  fullscreenSvg: document.getElementById("fullscreen-mindmap-svg"),
  fullscreenCanvas: document.getElementById("fullscreen-mindmap-canvas"),
  newRecordButton: document.getElementById("new-record-button"),
  tooltip: document.getElementById("flower-tooltip"),
  tooltipImage: document.getElementById("tooltip-image"),
  tooltipName: document.getElementById("tooltip-name"),
  tooltipScientific: document.getElementById("tooltip-scientific"),
  tooltipCharacteristics: document.getElementById("tooltip-characteristics"),
  tooltipSymbolism: document.getElementById("tooltip-symbolism"),
  flowerModal: document.getElementById("flower-modal"),
  flowerForm: document.getElementById("flower-form"),
  flowerModalTitle: document.getElementById("flower-modal-title"),
  flowerName: document.getElementById("flower-name"),
  flowerScientific: document.getElementById("flower-scientific"),
  flowerCharacteristics: document.getElementById("flower-characteristics"),
  flowerSymbolism: document.getElementById("flower-symbolism"),
  flowerImageTrigger: document.getElementById("flower-image-trigger"),
  flowerImageInput: document.getElementById("flower-image"),
  flowerImagePreview: document.getElementById("flower-image-preview"),
  flowerImageName: document.getElementById("flower-image-name"),
  clearFlowerImage: document.getElementById("clear-flower-image"),
  mapModal: document.getElementById("map-modal"),
  mapForm: document.getElementById("map-form"),
  mapTitleInput: document.getElementById("map-title-input"),
  branchModal: document.getElementById("branch-modal"),
  branchForm: document.getElementById("branch-form"),
  branchTextField: document.getElementById("branch-text-field"),
  branchFlowerField: document.getElementById("branch-flower-field"),
  branchText: document.getElementById("branch-text"),
  branchFlowerSelect: document.getElementById("branch-flower-select"),
  branchTypeRadios: Array.from(document.querySelectorAll('input[name="branch-type"]')),
  confirmModal: document.getElementById("confirm-modal"),
  confirmForm: document.getElementById("confirm-form"),
  confirmTitle: document.getElementById("confirm-title"),
  confirmCopy: document.getElementById("confirm-copy"),
  confirmButton: document.getElementById("confirm-button"),
  toastStack: document.getElementById("toast-stack"),
  emptyTemplate: document.getElementById("empty-template"),
  closeButtons: Array.from(document.querySelectorAll("[data-dialog-close]"))
};

const syncState = {
  service: createSupabaseBrowserService(),
  user: null,
  isHydrating: false,
  isSyncing: false,
  timer: 0,
  hasLocalCache: hasStoredLocalCache()
};

function renderSyncUi() {
  const configured = syncState.service.configured;
  const signedIn = Boolean(syncState.user);
  const busy = syncState.isHydrating || syncState.isSyncing;

  dom.syncCluster.dataset.mode = configured ? "cloud" : "local";
  dom.syncSignIn.hidden = signedIn;
  dom.syncSignOut.hidden = !signedIn;
  dom.syncSignIn.disabled = !configured || busy;
  dom.syncSignOut.disabled = busy;

  if (!configured) {
    dom.syncTitle.textContent = "本地模式";
    dom.syncMeta.textContent = "未配置 Supabase，当前花卉档案与导图仅保存在本机浏览器。";
    return;
  }

  if (!signedIn) {
    dom.syncTitle.textContent = "可连接云同步";
    dom.syncMeta.textContent = "登录后可在不同设备间共享花卉记录、思维导图和已上传图片。";
    return;
  }

  dom.syncTitle.textContent = busy ? "正在同步" : "云端同步已启用";
  dom.syncMeta.textContent = syncState.user.email || "当前花卉档案将自动同步到 Supabase。";
}

function bindSyncUi() {
  dom.syncSignIn.addEventListener("click", function () {
    if (!syncState.service.configured || syncState.isHydrating || syncState.isSyncing) {
      return;
    }
    dom.authEmail.value = syncState.user?.email || "";
    openAnimatedDialog(dom.authModal);
  });

  dom.syncSignOut.addEventListener("click", async function () {
    if (!syncState.user || syncState.isHydrating || syncState.isSyncing) {
      return;
    }
    try {
      syncState.isSyncing = true;
      renderSyncUi();
      await syncState.service.signOut();
      syncState.user = null;
    } catch (error) {
      console.error(error);
      dom.syncCluster.dataset.mode = "error";
      dom.syncMeta.textContent = error.message || "退出同步失败";
    } finally {
      syncState.isSyncing = false;
      renderSyncUi();
    }
  });

  dom.authForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (event.submitter && event.submitter.value === "cancel") {
      closeAnimatedDialog(dom.authModal);
      return;
    }

    const email = dom.authEmail.value.trim();
    if (!email) {
      dom.authEmail.focus();
      return;
    }

    try {
      syncState.isSyncing = true;
      renderSyncUi();
      await syncState.service.signInWithOtp(email);
      closeAnimatedDialog(dom.authModal);
      dom.syncMeta.textContent = "登录链接已发送，请完成邮箱验证后返回当前页面。";
    } catch (error) {
      console.error(error);
      dom.syncCluster.dataset.mode = "error";
      dom.syncMeta.textContent = error.message || "发送登录链接失败";
    } finally {
      syncState.isSyncing = false;
      renderSyncUi();
    }
  });
}

async function bootstrapSync() {
  renderSyncUi();
  if (!syncState.service.available) {
    return;
  }

  syncState.service.onAuthStateChange(async function (_event, session) {
    syncState.user = session?.user || null;
    renderSyncUi();
    if (syncState.user) {
      await hydrateFromCloud();
    }
  });

  try {
    const session = await syncState.service.getSession();
    syncState.user = session?.user || null;
    renderSyncUi();
    if (syncState.user) {
      await hydrateFromCloud();
    }
  } catch (error) {
    console.error(error);
    dom.syncCluster.dataset.mode = "error";
    dom.syncMeta.textContent = error.message || "Supabase 初始化失败";
  }
}

async function hydrateFromCloud() {
  if (!syncState.user || !syncState.service.available) {
    return;
  }

  syncState.isHydrating = true;
  renderSyncUi();
  try {
    const payload = await syncState.service.fetchToolDocument(syncState.user.id, TOOL_KEY);
    if (payload && typeof payload === "object") {
      await applyRemoteSnapshot(payload);
      return;
    }

    if (syncState.hasLocalCache) {
      await syncState.service.upsertToolDocument(syncState.user.id, TOOL_KEY, getSyncSnapshot());
      return;
    }

    await applyRemoteSnapshot({ flowers: [], maps: [], images: [] });
  } catch (error) {
    console.error(error);
    dom.syncCluster.dataset.mode = "error";
    dom.syncMeta.textContent = error.message || "花卉数据拉取失败";
  } finally {
    syncState.isHydrating = false;
    renderSyncUi();
  }
}

function getSyncSnapshot() {
  return {
    flowers: structuredClone(state.flowers),
    maps: structuredClone(state.maps),
    images: Object.keys(state.imageCache).map(function (key) {
      return structuredClone(state.imageCache[key]);
    })
  };
}

async function applyRemoteSnapshot(payload) {
  state.flowers = Array.isArray(payload.flowers) ? structuredClone(payload.flowers) : [];
  state.maps = Array.isArray(payload.maps)
    ? payload.maps.map(sanitizeMapRecord).filter(Boolean)
    : [];
  await replaceAllImages(Array.isArray(payload.images) ? payload.images : []);
  localStorage.setItem(STORAGE_KEYS.flowers, JSON.stringify(state.flowers));
  localStorage.setItem(STORAGE_KEYS.maps, JSON.stringify(state.maps));
  syncState.hasLocalCache = hasStoredLocalCache();
  ensureCurrentMap();
  render();
}

function scheduleCloudSync() {
  if (!syncState.user || !syncState.service.available || syncState.isHydrating) {
    return;
  }
  window.clearTimeout(syncState.timer);
  syncState.timer = window.setTimeout(function () {
    void flushCloudSync();
  }, 450);
}

async function flushCloudSync() {
  if (!syncState.user || !syncState.service.available || syncState.isHydrating) {
    return;
  }
  syncState.hasLocalCache = true;
  syncState.isSyncing = true;
  renderSyncUi();
  try {
    await syncState.service.upsertToolDocument(syncState.user.id, TOOL_KEY, getSyncSnapshot());
  } catch (error) {
    console.error(error);
    dom.syncCluster.dataset.mode = "error";
    dom.syncMeta.textContent = error.message || "花卉数据同步失败";
  } finally {
    syncState.isSyncing = false;
    renderSyncUi();
  }
}

bootstrap().catch(function (error) {
  console.error(error);
  showToast("加载失败", "页面初始化时发生错误，已回退为占位内容。", "warning");
});

async function bootstrap() {
  ensureCurrentMap();
  bindSyncUi();
  bindEvents();
  await hydrateImageCache();
  await bootstrapSync();
  render();
}

function bindEvents() {
  dom.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      state.ui.activeTab = tab.dataset.tab;
      persistUi();
      renderTabs();
    });
  });

  dom.listViewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      state.ui.listViewMode = button.dataset.listView;
      persistUi();
      renderFlowers();
    });
  });

  dom.flowerSearch.addEventListener("input", function () {
    state.ui.search = dom.flowerSearch.value.trim();
    persistUi();
    renderFlowers();
  });

  dom.flowerSort.addEventListener("change", function () {
    state.ui.sort = dom.flowerSort.value;
    persistUi();
    renderFlowers();
  });

  dom.mapSearch.addEventListener("input", function () {
    state.ui.mapSearch = dom.mapSearch.value.trim();
    persistUi();
    renderMapScenes();
  });

  dom.newRecordButton.addEventListener("click", function () {
    openFlowerModal("");
  });

  dom.flowerImageTrigger.addEventListener("click", handleImageTriggerClick);
  dom.flowerImageInput.addEventListener("change", handleImageChange);
  dom.flowerImageInput.addEventListener("cancel", handleFilePickerCancel, true);
  dom.clearFlowerImage.addEventListener("click", clearImageDraft);
  dom.flowerForm.addEventListener("submit", handleFlowerSubmit);

  dom.newMapButton.addEventListener("click", openMapModal);
  dom.mapForm.addEventListener("submit", handleMapSubmit);
  dom.deleteMapButton.addEventListener("click", function () {
    const currentMap = getCurrentMap();
    if (currentMap) {
      confirmDeleteMap(currentMap.id);
    }
  });
  dom.presentMapButton.addEventListener("click", openFullscreenMap);
  dom.closeFullscreenMap.addEventListener("click", closeFullscreenMap);

  dom.resetMapView.addEventListener("click", function () {
    setCurrentViewport(structuredClone(DEFAULT_VIEWPORT));
    persistUi();
    renderMapScenes();
    showToast("已重置视图", "当前思维导图的缩放与位置已恢复默认状态。");
  });

  dom.branchTypeRadios.forEach(function (radio) {
    radio.addEventListener("change", syncBranchFields);
  });

  dom.branchForm.addEventListener("submit", handleBranchSubmit);
  dom.confirmForm.addEventListener("submit", handleConfirmSubmit);

  dom.closeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      closeDialogById(button.dataset.dialogClose);
    });
  });

  [dom.flowerModal, dom.mapModal, dom.branchModal, dom.confirmModal].forEach(function (dialog) {
    dialog.addEventListener("cancel", function (event) {
      if (dialog === dom.flowerModal && runtime.filePickerActive) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      closeAnimatedDialog(dialog);
    });

    dialog.addEventListener("close", function () {
      runtime.openDialogs.delete(dialog.id);
      syncModalLock();
      if (dialog === dom.confirmModal) {
        state.confirmAction = null;
      }
      if (dialog === dom.mapModal) {
        dom.mapTitleInput.value = "";
      }
    });
  });

  dom.mapList.addEventListener("click", handleMapListClick);
  document.addEventListener("click", handleDocumentClick);

  bindGalleryDragging();
  bindViewportInteractions(dom.viewport);
  bindViewportInteractions(dom.fullscreenViewport);

  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mouseup", handlePointerUp);
  window.addEventListener("resize", hideTooltip);
  window.addEventListener("focus", function () {
    if (runtime.filePickerActive) {
      window.setTimeout(function () {
        runtime.filePickerActive = false;
      }, 120);
    }
  });
}

function render() {
  renderTabs();
  renderFlowers();
  renderMapLibrary();
  renderMapScenes();
  renderStats();
}

function renderTabs() {
  dom.tabs.forEach(function (tab) {
    tab.classList.toggle("is-active", tab.dataset.tab === state.ui.activeTab);
  });

  dom.panels.forEach(function (panel) {
    panel.classList.toggle("is-active", panel.dataset.panel === state.ui.activeTab);
  });

  dom.newRecordButton.classList.toggle("is-hidden", state.ui.activeTab !== "list");
}

function renderFlowers() {
  dom.flowerSearch.value = state.ui.search;
  dom.flowerSort.value = state.ui.sort;

  dom.listViewButtons.forEach(function (button) {
    button.classList.toggle("is-active", button.dataset.listView === state.ui.listViewMode);
  });

  const flowers = getVisibleFlowers();
  const isGallery = state.ui.listViewMode === "gallery";

  dom.flowerGrid.style.display = isGallery ? "none" : "";
  dom.flowerGallery.classList.toggle("is-hidden", !isGallery);

  renderFlowerGrid(flowers);
  renderFlowerGallery(flowers);
}

function renderFlowerGrid(flowers) {
  dom.flowerGrid.innerHTML = "";

  if (!flowers.length) {
    dom.flowerGrid.appendChild(dom.emptyTemplate.content.cloneNode(true));
    return;
  }

  flowers.forEach(function (flower) {
    const card = document.createElement("article");
    card.className = "flower-card";
    card.innerHTML = [
      '<div class="flower-card-head">',
      renderImageMarkup("flower-avatar", flower, 58),
      "<div>",
      "<h3>" + escapeHtml(flower.name) + "</h3>",
      '<p class="scientific-name">' + escapeHtml(flower.scientificName || "未填写学名") + "</p>",
      "</div>",
      "</div>",
      '<p class="flower-characteristics">' + escapeHtml(flower.characteristics || "暂未填写特征描述。") + "</p>",
      '<div class="flower-card-footer">',
      '<span class="symbolism-chip"><span class="material-symbols-outlined" aria-hidden="true">local_florist</span><span>' +
        escapeHtml(flower.symbolism || "待补充象征意义") +
        "</span></span>",
      '<div class="card-actions">',
      '<button class="icon-button" type="button" data-action="edit" aria-label="编辑记录"><span class="material-symbols-outlined" aria-hidden="true">edit</span></button>',
      '<button class="icon-button icon-button-danger" type="button" data-action="delete" aria-label="删除记录"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>',
      "</div>",
      "</div>"
    ].join("");

    card.querySelector('[data-action="edit"]').addEventListener("click", function () {
      openFlowerModal(flower.id);
    });
    card.querySelector('[data-action="delete"]').addEventListener("click", function () {
      confirmDeleteFlower(flower.id);
    });

    dom.flowerGrid.appendChild(card);
  });
}

function renderFlowerGallery(flowers) {
  dom.flowerGalleryTrack.innerHTML = "";

  if (!flowers.length) {
    const wrapper = document.createElement("div");
    wrapper.style.minWidth = "100%";
    wrapper.appendChild(dom.emptyTemplate.content.cloneNode(true));
    dom.flowerGalleryTrack.appendChild(wrapper);
    return;
  }

  flowers.forEach(function (flower, index) {
    const slot = document.createElement("article");
    slot.className = "gallery-card-slot " + (index % 2 === 0 ? "is-top" : "is-bottom");
    slot.innerHTML = [
      '<div class="gallery-card">',
      renderImageMarkup("gallery-card-image", flower, 160),
      "<div>",
      "<h3>" + escapeHtml(flower.name) + "</h3>",
      '<p class="scientific-name">' + escapeHtml(flower.scientificName || "未填写学名") + "</p>",
      '<p class="gallery-card-description">' + escapeHtml(flower.characteristics || "暂未填写特征描述。") + "</p>",
      "</div>",
      '<div class="gallery-card-footer">',
      '<span class="symbolism-chip">' + escapeHtml(flower.symbolism || "待补充象征意义") + "</span>",
      '<div class="gallery-card-actions">',
      '<button class="icon-button" type="button" data-action="edit" aria-label="编辑记录"><span class="material-symbols-outlined" aria-hidden="true">edit</span></button>',
      '<button class="icon-button icon-button-danger" type="button" data-action="delete" aria-label="删除记录"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>',
      "</div>",
      "</div>",
      "</div>"
    ].join("");

    slot.querySelector('[data-action="edit"]').addEventListener("click", function () {
      openFlowerModal(flower.id);
    });
    slot.querySelector('[data-action="delete"]').addEventListener("click", function () {
      confirmDeleteFlower(flower.id);
    });

    dom.flowerGalleryTrack.appendChild(slot);
  });
}

function renderMapLibrary() {
  ensureCurrentMap();
  const currentMap = getCurrentMap();
  dom.mapList.innerHTML = "";

  state.maps.forEach(function (map) {
    const item = document.createElement("div");
    item.className = "map-list-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "map-select-button" + (currentMap && currentMap.id === map.id ? " is-active" : "");
    button.dataset.mapId = map.id;
    button.dataset.action = "select";
    button.innerHTML = [
      "<strong>" + escapeHtml(map.title) + "</strong>",
      "<span>" + countDisplayNodes(map.tree) + " 个分支节点</span>"
    ].join("");

    const menu = document.createElement("div");
    menu.className = "map-list-menu" + (runtime.openMapMenuId === map.id ? " is-open" : "");
    menu.innerHTML = [
      '<button class="icon-button map-menu-trigger" type="button" data-action="toggle-menu" data-map-id="' + escapeAttribute(map.id) + '" aria-label="更多操作">',
      '<span class="material-symbols-outlined" aria-hidden="true">more_horiz</span>',
      "</button>",
      '<div class="map-menu-popover' + (runtime.openMapMenuId === map.id ? "" : " is-hidden") + '">',
      '<button class="ghost-button map-menu-item" type="button" data-action="delete-map" data-map-id="' + escapeAttribute(map.id) + '">',
      '<span class="material-symbols-outlined" aria-hidden="true">delete</span>',
      "<span>删除导图</span>",
      "</button>",
      "</div>"
    ].join("");

    item.appendChild(button);
    item.appendChild(menu);
    dom.mapList.appendChild(item);
  });
}

function renderMapScenes() {
  ensureCurrentMap();
  const currentMap = getCurrentMap();
  const viewport = getCurrentViewport();

  dom.mapSearch.value = state.ui.mapSearch;
  dom.zoomBadge.textContent = Math.round(viewport.scale * 100) + "%";

  if (!currentMap) {
    dom.activeMapTitle.textContent = "暂无思维导图";
    dom.fullscreenTitle.textContent = "思维导图展示";
    dom.canvas.innerHTML = "";
    dom.svg.innerHTML = "";
    dom.fullscreenCanvas.innerHTML = "";
    dom.fullscreenSvg.innerHTML = "";
    return;
  }

  dom.activeMapTitle.textContent = currentMap.title;
  dom.fullscreenTitle.textContent = currentMap.title + " · 全屏展示";

  renderMapScene({
    map: currentMap,
    viewportEl: dom.viewport,
    svgEl: dom.svg,
    canvasEl: dom.canvas,
    interactive: true
  });

  if (state.ui.isMapFullscreen) {
    dom.fullscreenShell.classList.remove("is-hidden");
    document.body.classList.add("fullscreen-map-open");
    renderMapScene({
      map: currentMap,
      viewportEl: dom.fullscreenViewport,
      svgEl: dom.fullscreenSvg,
      canvasEl: dom.fullscreenCanvas,
      interactive: false
    });
  } else {
    dom.fullscreenShell.classList.add("is-hidden");
    document.body.classList.remove("fullscreen-map-open");
  }
}

function renderMapScene(config) {
  const currentMap = config.map;
  const viewport = getCurrentViewport();
  const layout = layoutTree(currentMap.tree);
  const visibleLookup = buildVisibleNodeLookup(layout, state.ui.mapSearch);
  const transform = "translate(" + viewport.x + "px, " + viewport.y + "px) scale(" + viewport.scale + ")";

  config.canvasEl.innerHTML = "";
  config.svgEl.innerHTML = "";
  config.canvasEl.style.transform = transform;
  config.svgEl.style.transform = transform;

  renderConnectors(layout, visibleLookup, config.svgEl);
  renderNodes(layout, visibleLookup, config.canvasEl, config.interactive);
}

function renderNodes(node, visibleLookup, canvasEl, interactive) {
  if (visibleLookup.has(node.id)) {
    const element = document.createElement("div");
    element.className = "mindmap-node " + node.type;
    element.style.left = node.x + "px";
    element.style.top = node.y + "px";

    if (node.type === "flowerRef") {
      const flower = getFlowerById(node.flowerId);
      element.innerHTML = [
        '<div class="node-pill">',
        renderImageMarkup("node-avatar", flower || { name: node.label, imageId: "" }, 40),
        "<div>",
        '<span class="node-label">' + escapeHtml(flower ? flower.name : node.label) + "</span>",
        '<span class="node-meta">' + escapeHtml(flower && flower.scientificName ? flower.scientificName : "未填写学名") + "</span>",
        "</div>",
        "</div>",
        interactive
          ? '<button class="node-tool node-tool-delete" type="button" data-action="delete-node" aria-label="删除节点"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>'
          : ""
      ].join("");

      element.addEventListener("mouseenter", function (event) {
        showTooltip(event, node.flowerId);
      });
      element.addEventListener("mousemove", moveTooltip);
      element.addEventListener("mouseleave", hideTooltip);

      const deleteButton = element.querySelector('[data-action="delete-node"]');
      if (deleteButton) {
        deleteButton.addEventListener("click", function (event) {
          event.stopPropagation();
          confirmDeleteNode(node.id);
        });
      }
    } else {
      element.innerHTML = [
        '<div class="node-pill"><span class="node-label">' + escapeHtml(node.label) + "</span></div>",
        interactive
          ? '<button class="node-tool node-tool-add" type="button" data-action="add-node" aria-label="新增分支"><span class="material-symbols-outlined" aria-hidden="true">add</span></button>'
          : "",
        interactive && node.id !== ROOT_ID
          ? '<button class="node-tool node-tool-delete" type="button" data-action="delete-node" aria-label="删除节点"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>'
          : ""
      ].join("");

      const addButton = element.querySelector('[data-action="add-node"]');
      if (addButton) {
        addButton.addEventListener("click", function (event) {
          event.stopPropagation();
          openBranchModal(node.id);
        });
      }

      const deleteButton = element.querySelector('[data-action="delete-node"]');
      if (deleteButton) {
        deleteButton.addEventListener("click", function (event) {
          event.stopPropagation();
          confirmDeleteNode(node.id);
        });
      }
    }

    canvasEl.appendChild(element);
  }

  node.children.forEach(function (child) {
    renderNodes(child, visibleLookup, canvasEl, interactive);
  });
}

function renderConnectors(node, visibleLookup, svgEl) {
  if (!visibleLookup.has(node.id)) {
    node.children.forEach(function (child) {
      renderConnectors(child, visibleLookup, svgEl);
    });
    return;
  }

  node.children.forEach(function (child) {
    if (visibleLookup.has(child.id)) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const startX = node.x + getNodeWidth(node);
      const startY = node.y + 26;
      const endX = child.x;
      const endY = child.y + 26;
      const curve = "M " + startX + " " + startY + " C " + (startX + 78) + " " + startY + ", " + (endX - 78) + " " + endY + ", " + endX + " " + endY;
      path.setAttribute("d", curve);
      path.setAttribute("class", "connector-path");
      svgEl.appendChild(path);
    }
    renderConnectors(child, visibleLookup, svgEl);
  });
}

function renderStats() {
  dom.statFlowers.textContent = String(state.flowers.length);
  const currentMap = getCurrentMap();
  dom.statNodes.textContent = currentMap ? String(countDisplayNodes(currentMap.tree)) : "0";
}

function openFlowerModal(flowerId) {
  state.editingFlowerId = flowerId || "";
  state.imageDraft = null;
  runtime.filePickerActive = false;

  const flower = getFlowerById(flowerId);
  dom.flowerModalTitle.textContent = flower ? "编辑花卉记录" : "新建花卉记录";
  dom.flowerName.value = flower ? flower.name : "";
  dom.flowerScientific.value = flower ? flower.scientificName : "";
  dom.flowerCharacteristics.value = flower ? flower.characteristics : "";
  dom.flowerSymbolism.value = flower ? flower.symbolism : "";
  dom.flowerImageInput.value = "";
  renderImagePreview(flower);
  openAnimatedDialog(dom.flowerModal);
}

async function handleFlowerSubmit(event) {
  event.preventDefault();

  const name = dom.flowerName.value.trim();
  if (!name) {
    dom.flowerName.focus();
    showToast("缺少名称", "请先填写花卉名称，再保存记录。", "warning");
    return;
  }

  const now = new Date().toISOString();
  let flower = getFlowerById(state.editingFlowerId);
  const isEditing = Boolean(flower);

  if (!flower) {
    flower = {
      id: crypto.randomUUID(),
      name: "",
      scientificName: "",
      characteristics: "",
      symbolism: "",
      imageId: "",
      imageName: "",
      imageMimeType: "",
      createdAt: now,
      updatedAt: now
    };
    state.flowers.unshift(flower);
  }

  flower.name = name;
  flower.scientificName = dom.flowerScientific.value.trim();
  flower.characteristics = dom.flowerCharacteristics.value.trim();
  flower.symbolism = dom.flowerSymbolism.value.trim();
  flower.updatedAt = now;

  if (state.imageDraft && state.imageDraft.mode === "clear") {
    await removeFlowerImage(flower);
  } else if (state.imageDraft && state.imageDraft.mode === "replace") {
    await saveFlowerImage(flower, state.imageDraft.fileName, state.imageDraft.mimeType, state.imageDraft.dataUrl);
  }

  state.maps.forEach(function (map) {
    updateFlowerRefs(map.tree, flower.id, flower.name);
  });

  state.imageDraft = null;
  persistFlowers();
  persistMaps();
  closeAnimatedDialog(dom.flowerModal);
  renderFlowers();
  renderMapLibrary();
  renderMapScenes();
  renderStats();
  showToast(isEditing ? "已更新记录" : "已创建记录", "“" + flower.name + "”已保存到本地花卉档案。");
}

function handleImageTriggerClick() {
  runtime.filePickerActive = true;
  dom.flowerImageInput.click();
}

function handleFilePickerCancel(event) {
  event.stopPropagation();
  runtime.filePickerActive = false;
}

function handleImageChange(event) {
  runtime.filePickerActive = false;
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  if (!file.type || file.type.indexOf("image/") !== 0) {
    dom.flowerImageInput.value = "";
    showToast("文件类型不支持", "请选择常见图片格式后再上传。", "warning");
    return;
  }

  readFileAsDataUrl(file)
    .then(function (dataUrl) {
      state.imageDraft = {
        mode: "replace",
        fileName: file.name,
        mimeType: file.type,
        dataUrl: dataUrl
      };
      renderImagePreview(getFlowerById(state.editingFlowerId));
    })
    .catch(function () {
      showToast("读取失败", "图片读取失败，请重新选择文件。", "warning");
    });
}

function clearImageDraft() {
  state.imageDraft = { mode: "clear" };
  dom.flowerImageInput.value = "";
  renderImagePreview(getFlowerById(state.editingFlowerId));
}

function renderImagePreview(flower) {
  const swatches = getFlowerSwatches(flower && flower.name ? flower.name : dom.flowerName.value || "flower");
  dom.flowerImagePreview.style.setProperty("--swatch-a", swatches[0]);
  dom.flowerImagePreview.style.setProperty("--swatch-b", swatches[1]);

  let dataUrl = "";
  if (state.imageDraft && state.imageDraft.mode === "replace") {
    dataUrl = state.imageDraft.dataUrl;
  } else if (flower && flower.imageId && state.imageCache[flower.imageId]) {
    dataUrl = state.imageCache[flower.imageId].dataUrl;
  }

  dom.flowerImagePreview.classList.toggle("has-image", Boolean(dataUrl));
  dom.flowerImagePreview.innerHTML = dataUrl
    ? '<img src="' + escapeAttribute(dataUrl) + '" alt="flower preview">'
    : "";

  if (state.imageDraft && state.imageDraft.mode === "replace") {
    dom.flowerImageName.textContent = state.imageDraft.fileName;
  } else if (state.imageDraft && state.imageDraft.mode === "clear") {
    dom.flowerImageName.textContent = "图片将在保存后移除";
  } else if (flower && flower.imageName) {
    dom.flowerImageName.textContent = flower.imageName;
  } else {
    dom.flowerImageName.textContent = "未选择图片";
  }
}

function openMapModal() {
  dom.mapTitleInput.value = "";
  openAnimatedDialog(dom.mapModal);
  dom.mapTitleInput.focus();
}

function handleMapSubmit(event) {
  event.preventDefault();

  const title = dom.mapTitleInput.value.trim();
  if (!title) {
    dom.mapTitleInput.focus();
    showToast("缺少名称", "请先填写思维导图名称。", "warning");
    return;
  }

  const map = createMapRecord(crypto.randomUUID(), title);
  state.maps.unshift(map);
  state.ui.selectedMapId = map.id;
  ensureViewportForMap(map.id);
  persistMaps();
  persistUi();
  closeAnimatedDialog(dom.mapModal);
  runtime.openMapMenuId = "";
  renderMapLibrary();
  renderMapScenes();
  renderStats();
  showToast("已创建导图", "“" + title + "”已加入导图库。");
}

function openBranchModal(parentId) {
  state.branchParentId = parentId;
  fillFlowerSelect();
  dom.branchText.value = "";
  dom.branchTypeRadios[0].checked = true;
  syncBranchFields();
  openAnimatedDialog(dom.branchModal);
}

function fillFlowerSelect() {
  const options = state.flowers
    .slice()
    .sort(function (a, b) {
      return a.name.localeCompare(b.name, "zh");
    })
    .map(function (flower) {
      return '<option value="' + escapeAttribute(flower.id) + '">' +
        escapeHtml(flower.name) +
        (flower.scientificName ? " · " + escapeHtml(flower.scientificName) : "") +
        "</option>";
    })
    .join("");

  dom.branchFlowerSelect.innerHTML = options || '<option value="">暂无可关联的花卉记录</option>';
}

function syncBranchFields() {
  const type = getSelectedBranchType();
  dom.branchTextField.classList.toggle("is-hidden", type !== "text");
  dom.branchFlowerField.classList.toggle("is-hidden", type !== "flowerRef");
}

function handleBranchSubmit(event) {
  event.preventDefault();

  const currentMap = getCurrentMap();
  if (!currentMap) {
    return;
  }

  const type = getSelectedBranchType();
  let nextNode;

  if (type === "text") {
    const label = dom.branchText.value.trim();
    if (!label) {
      dom.branchText.focus();
      showToast("缺少文本", "请输入分支名称后再保存。", "warning");
      return;
    }
    nextNode = { id: crypto.randomUUID(), type: "text", label: label, children: [] };
  } else {
    const flower = getFlowerById(dom.branchFlowerSelect.value);
    if (!flower) {
      showToast("没有可关联的记录", "请先在花卉列表中创建花卉记录。", "warning");
      return;
    }
    nextNode = { id: crypto.randomUUID(), type: "flowerRef", label: flower.name, flowerId: flower.id, children: [] };
  }

  insertNode(currentMap.tree, state.branchParentId, nextNode);
  currentMap.updatedAt = new Date().toISOString();
  persistMaps();
  closeAnimatedDialog(dom.branchModal);
  renderMapLibrary();
  renderMapScenes();
  renderStats();
  showToast("已添加分支", "新的思维导图节点已加入当前结构。");
}

function handleMapListClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const mapId = button.dataset.mapId;

  if (action === "select") {
    state.ui.selectedMapId = button.dataset.mapId;
    runtime.openMapMenuId = "";
    ensureCurrentMap();
    persistUi();
    renderMapLibrary();
    renderMapScenes();
    renderStats();
    return;
  }

  if (action === "toggle-menu") {
    event.stopPropagation();
    runtime.openMapMenuId = runtime.openMapMenuId === mapId ? "" : mapId;
    renderMapLibrary();
    return;
  }

  if (action === "delete-map") {
    event.stopPropagation();
    runtime.openMapMenuId = "";
    confirmDeleteMap(mapId);
  }
}

function handleDocumentClick(event) {
  if (runtime.openMapMenuId && !event.target.closest(".map-list-menu")) {
    runtime.openMapMenuId = "";
    renderMapLibrary();
  }
}

function confirmDeleteFlower(flowerId) {
  const flower = getFlowerById(flowerId);
  if (!flower) {
    return;
  }

  openConfirmModal(
    "删除花卉记录",
    "确定删除“" + flower.name + "”吗？该记录关联的思维导图引用和本地图片也会一并移除。",
    "删除记录",
    async function () {
      await removeFlowerImage(flower);
      state.flowers = state.flowers.filter(function (item) {
        return item.id !== flowerId;
      });
      state.maps.forEach(function (map) {
        removeFlowerRefs(map.tree, flowerId);
      });
      persistFlowers();
      persistMaps();
      renderFlowers();
      renderMapLibrary();
      renderMapScenes();
      renderStats();
      hideTooltip();
      showToast("已删除记录", "“" + flower.name + "”及其导图引用已移除。", "danger");
    }
  );
}

function confirmDeleteNode(nodeId) {
  const currentMap = getCurrentMap();
  if (!currentMap || nodeId === ROOT_ID) {
    return;
  }

  const node = findNode(currentMap.tree, nodeId);
  if (!node) {
    return;
  }

  openConfirmModal(
    "删除导图分支",
    "确定删除“" + node.label + "”及其全部下级节点吗？此操作不可撤销。",
    "删除分支",
    function () {
      removeNode(currentMap.tree, nodeId);
      currentMap.updatedAt = new Date().toISOString();
      persistMaps();
      renderMapLibrary();
      renderMapScenes();
      renderStats();
      hideTooltip();
      showToast("已删除分支", "“" + node.label + "”已从当前思维导图中移除。", "danger");
    }
  );
}

function confirmDeleteMap(mapId) {
  const map = getMapById(mapId);
  if (!map) {
    return;
  }

  openConfirmModal(
    "删除思维导图",
    "确定删除“" + map.title + "”吗？该导图下的全部分支结构都会被移除。",
    "删除导图",
    function () {
      deleteMap(mapId);
    }
  );
}

function deleteMap(mapId) {
  const map = getMapById(mapId);
  if (!map) {
    return;
  }

  state.maps = state.maps.filter(function (item) {
    return item.id !== mapId;
  });

  delete state.ui.mapViewports[mapId];

  if (!state.maps.length) {
    const fallbackMap = createMapRecord(crypto.randomUUID(), "未命名导图");
    state.maps.push(fallbackMap);
  }

  if (state.ui.selectedMapId === mapId) {
    state.ui.selectedMapId = state.maps[0].id;
  }

  ensureCurrentMap();
  persistMaps();
  persistUi();
  closeFullscreenMap();
  renderMapLibrary();
  renderMapScenes();
  renderStats();
  showToast("已删除导图", "“" + map.title + "”已从导图库移除。", "danger");
}

function openFullscreenMap() {
  if (!getCurrentMap()) {
    return;
  }
  state.ui.isMapFullscreen = true;
  persistUi();
  renderMapScenes();
}

function closeFullscreenMap() {
  state.ui.isMapFullscreen = false;
  persistUi();
  renderMapScenes();
}

function openConfirmModal(title, copy, confirmLabel, onConfirm) {
  dom.confirmTitle.textContent = title;
  dom.confirmCopy.textContent = copy;
  dom.confirmButton.textContent = confirmLabel;
  state.confirmAction = onConfirm;
  openAnimatedDialog(dom.confirmModal);
}

async function handleConfirmSubmit(event) {
  event.preventDefault();
  const action = state.confirmAction;
  closeAnimatedDialog(dom.confirmModal);
  if (typeof action === "function") {
    await action();
  }
}

function closeDialogById(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    closeAnimatedDialog(dialog);
  }
}

function openAnimatedDialog(dialog) {
  window.clearTimeout(runtime.modalTimers.get(dialog));
  dialog.classList.remove("is-closing");
  if (!dialog.open) {
    dialog.showModal();
  }
  runtime.openDialogs.add(dialog.id);
  syncModalLock();
}

function closeAnimatedDialog(dialog) {
  if (!dialog || !dialog.open || dialog.classList.contains("is-closing")) {
    return;
  }

  dialog.classList.add("is-closing");
  const timer = window.setTimeout(function () {
    dialog.classList.remove("is-closing");
    if (dialog.open) {
      dialog.close();
    }
  }, MODAL_MS);
  runtime.modalTimers.set(dialog, timer);
}

function syncModalLock() {
  document.body.classList.toggle("modal-open", runtime.openDialogs.size > 0);
}

function showToast(title, message, tone) {
  const toast = document.createElement("article");
  const nextTone = tone || "success";
  toast.className = "toast";
  toast.dataset.tone = nextTone;
  toast.innerHTML = [
    '<div class="toast-icon"><span class="material-symbols-outlined" aria-hidden="true">' + getToastIcon(nextTone) + "</span></div>",
    "<div>",
    '<p class="toast-title">' + escapeHtml(title) + "</p>",
    '<p class="toast-message">' + escapeHtml(message) + "</p>",
    "</div>",
    '<button class="icon-button" type="button" aria-label="关闭提示"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>'
  ].join("");

  const remove = function () {
    if (!toast.isConnected) {
      return;
    }
    toast.classList.add("is-leaving");
    window.setTimeout(function () {
      if (toast.isConnected) {
        toast.remove();
      }
    }, 180);
  };

  toast.querySelector("button").addEventListener("click", remove);
  dom.toastStack.appendChild(toast);
  requestAnimationFrame(function () {
    toast.classList.add("is-visible");
  });

  const timer = window.setTimeout(remove, 2800);
  runtime.toastTimers.set(toast, timer);
}

function getToastIcon(tone) {
  if (tone === "warning") {
    return "warning";
  }
  if (tone === "danger") {
    return "delete";
  }
  return "check_circle";
}

function bindGalleryDragging() {
  dom.flowerGalleryScroll.addEventListener("mousedown", function (event) {
    if (event.button !== 0 || event.target.closest("button")) {
      return;
    }
    runtime.galleryDrag = {
      startX: event.clientX,
      scrollLeft: dom.flowerGalleryScroll.scrollLeft
    };
    dom.flowerGalleryScroll.classList.add("is-dragging");
  });
}

function bindViewportInteractions(viewportEl) {
  viewportEl.addEventListener("mousedown", function (event) {
    if (event.button !== 0 || event.target.closest("button, input, select, textarea")) {
      return;
    }

    runtime.viewportDrag = {
      viewportEl: viewportEl,
      startX: event.clientX,
      startY: event.clientY,
      origin: getCurrentViewport()
    };
    viewportEl.classList.add("is-dragging");
  });

  viewportEl.addEventListener("wheel", function (event) {
    event.preventDefault();
    const current = getCurrentViewport();
    const nextScale = clamp(current.scale * (event.deltaY > 0 ? 0.92 : 1.08), 0.6, 1.85);
    setCurrentViewport({
      x: current.x,
      y: current.y,
      scale: Number(nextScale.toFixed(2))
    });
    persistUi();
    renderMapScenes();
  }, { passive: false });
}

function handlePointerMove(event) {
  if (runtime.galleryDrag) {
    dom.flowerGalleryScroll.scrollLeft = runtime.galleryDrag.scrollLeft - (event.clientX - runtime.galleryDrag.startX);
  }

  if (runtime.viewportDrag) {
    const origin = runtime.viewportDrag.origin;
    setCurrentViewport({
      x: origin.x + event.clientX - runtime.viewportDrag.startX,
      y: origin.y + event.clientY - runtime.viewportDrag.startY,
      scale: origin.scale
    });
    renderMapScenes();
  }
}

function handlePointerUp() {
  if (runtime.galleryDrag) {
    runtime.galleryDrag = null;
    dom.flowerGalleryScroll.classList.remove("is-dragging");
  }

  if (runtime.viewportDrag) {
    runtime.viewportDrag.viewportEl.classList.remove("is-dragging");
    runtime.viewportDrag = null;
    persistUi();
  }
}

function showTooltip(event, flowerId) {
  const flower = getFlowerById(flowerId);
  if (!flower) {
    return;
  }

  runtime.tooltipFlowerId = flowerId;
  applyImageElement(dom.tooltipImage, flower);
  dom.tooltipName.textContent = flower.name;
  dom.tooltipScientific.textContent = flower.scientificName || "未填写学名";
  dom.tooltipCharacteristics.textContent = flower.characteristics || "暂未填写特征描述。";
  dom.tooltipSymbolism.textContent = flower.symbolism || "待补充象征意义";
  dom.tooltip.hidden = false;
  moveTooltip(event);
  requestAnimationFrame(function () {
    dom.tooltip.classList.add("is-visible");
  });
}

function moveTooltip(event) {
  if (!runtime.tooltipFlowerId) {
    return;
  }
  const width = 272;
  const gap = 18;
  const left = Math.min(event.clientX + gap, window.innerWidth - width - 12);
  const top = Math.max(12, event.clientY - 42);
  dom.tooltip.style.left = left + "px";
  dom.tooltip.style.top = top + "px";
}

function hideTooltip() {
  runtime.tooltipFlowerId = "";
  dom.tooltip.classList.remove("is-visible");
  window.setTimeout(function () {
    if (!runtime.tooltipFlowerId) {
      dom.tooltip.hidden = true;
    }
  }, 180);
}

function applyImageElement(container, flower) {
  const swatches = getFlowerSwatches(flower && flower.name ? flower.name : "flower");
  container.style.setProperty("--swatch-a", swatches[0]);
  container.style.setProperty("--swatch-b", swatches[1]);
  const imageData = flower && flower.imageId ? state.imageCache[flower.imageId] : null;
  container.classList.toggle("has-image", Boolean(imageData && imageData.dataUrl));
  container.innerHTML = imageData && imageData.dataUrl
    ? '<img src="' + escapeAttribute(imageData.dataUrl) + '" alt="' + escapeAttribute(flower.name || "flower") + '">'
    : "";
}

function renderImageMarkup(className, flower, size) {
  const swatches = getFlowerSwatches(flower && flower.name ? flower.name : "flower");
  const imageData = flower && flower.imageId ? state.imageCache[flower.imageId] : null;
  const classes = [className];
  if (imageData && imageData.dataUrl) {
    classes.push("has-image");
  }

  return [
    '<div class="' + classes.join(" ") + '" style="--swatch-a:' + swatches[0] + "; --swatch-b:" + swatches[1] + "; width:" + size + "px; height:" + size + 'px;">',
    imageData && imageData.dataUrl
      ? '<img src="' + escapeAttribute(imageData.dataUrl) + '" alt="' + escapeAttribute((flower && flower.name) || "flower") + '">'
      : "",
    "</div>"
  ].join("");
}

function getVisibleFlowers() {
  const query = normalize(state.ui.search);
  const flowers = state.flowers.slice();

  flowers.sort(function (a, b) {
    if (state.ui.sort === "recent") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return a.name.localeCompare(b.name, "zh");
  });

  if (!query) {
    return flowers;
  }

  return flowers.filter(function (flower) {
    return [flower.name, flower.scientificName, flower.characteristics, flower.symbolism].some(function (value) {
      return normalize(value).indexOf(query) >= 0;
    });
  });
}

function buildVisibleNodeLookup(root, queryText) {
  const lookup = new Set();
  const query = normalize(queryText);

  function visit(node) {
    const flower = node.type === "flowerRef" ? getFlowerById(node.flowerId) : null;
    const text = [
      node.label,
      flower ? flower.name : "",
      flower ? flower.scientificName : "",
      flower ? flower.characteristics : "",
      flower ? flower.symbolism : ""
    ].map(normalize).join(" ");

    const selfMatch = !query || text.indexOf(query) >= 0;
    let childMatch = false;

    node.children.forEach(function (child) {
      if (visit(child)) {
        childMatch = true;
      }
    });

    const visible = selfMatch || childMatch || node.id === ROOT_ID;
    if (visible) {
      lookup.add(node.id);
    }
    return visible;
  }

  visit(root);
  return lookup;
}

function layoutTree(root) {
  const clone = structuredClone(root);
  const widthGap = 300;
  const rowGap = 104;

  function assign(node, depth, startY) {
    node.x = depth * widthGap;
    if (!node.children.length) {
      node.y = startY;
      node.subtreeHeight = 52;
      return node.subtreeHeight;
    }

    let currentY = startY;
    let totalHeight = 0;

    node.children.forEach(function (child, index) {
      const childHeight = assign(child, depth + 1, currentY);
      currentY += childHeight + rowGap;
      totalHeight += childHeight;
      if (index < node.children.length - 1) {
        totalHeight += rowGap;
      }
    });

    node.subtreeHeight = Math.max(totalHeight, 52);
    node.y = startY + node.subtreeHeight / 2 - 26;
    return node.subtreeHeight;
  }

  assign(clone, 0, 0);
  return clone;
}

function getNodeWidth(node) {
  if (node.type === "root") {
    return 180;
  }
  if (node.type === "text") {
    return 170;
  }
  return 220;
}

function countNodes(node) {
  return 1 + node.children.reduce(function (sum, child) {
    return sum + countNodes(child);
  }, 0);
}

function countDisplayNodes(node) {
  return Math.max(0, countNodes(node) - 1);
}

function getSelectedBranchType() {
  const checked = dom.branchTypeRadios.find(function (radio) {
    return radio.checked;
  });
  return checked ? checked.value : "text";
}

function getFlowerById(flowerId) {
  return state.flowers.find(function (flower) {
    return flower.id === flowerId;
  }) || null;
}

function getMapById(mapId) {
  return state.maps.find(function (map) {
    return map.id === mapId;
  }) || null;
}

function getCurrentMap() {
  return getMapById(state.ui.selectedMapId);
}

function ensureCurrentMap() {
  if (!state.ui.selectedMapId || !getMapById(state.ui.selectedMapId)) {
    state.ui.selectedMapId = state.maps[0]?.id || "";
  }

  if (!state.ui.selectedMapId) {
    return;
  }

  ensureViewportForMap(state.ui.selectedMapId);
}

function ensureViewportForMap(mapId) {
  if (!state.ui.mapViewports[mapId]) {
    state.ui.mapViewports[mapId] = structuredClone(DEFAULT_VIEWPORT);
  }
}

function getCurrentViewport() {
  ensureCurrentMap();
  ensureViewportForMap(state.ui.selectedMapId);
  const viewport = state.ui.mapViewports[state.ui.selectedMapId];
  return {
    x: viewport.x,
    y: viewport.y,
    scale: viewport.scale
  };
}

function setCurrentViewport(nextViewport) {
  ensureCurrentMap();
  state.ui.mapViewports[state.ui.selectedMapId] = {
    x: nextViewport.x,
    y: nextViewport.y,
    scale: nextViewport.scale
  };
}

function updateFlowerRefs(node, flowerId, nextLabel) {
  if (node.type === "flowerRef" && node.flowerId === flowerId) {
    node.label = nextLabel;
  }
  node.children.forEach(function (child) {
    updateFlowerRefs(child, flowerId, nextLabel);
  });
}

function removeFlowerRefs(node, flowerId) {
  node.children = node.children.filter(function (child) {
    return !(child.type === "flowerRef" && child.flowerId === flowerId);
  });
  node.children.forEach(function (child) {
    removeFlowerRefs(child, flowerId);
  });
}

function insertNode(node, parentId, nextNode) {
  if (node.id === parentId) {
    node.children.push(nextNode);
    return true;
  }

  return node.children.some(function (child) {
    return insertNode(child, parentId, nextNode);
  });
}

function removeNode(node, nodeId) {
  const index = node.children.findIndex(function (child) {
    return child.id === nodeId;
  });

  if (index >= 0) {
    node.children.splice(index, 1);
    return true;
  }

  return node.children.some(function (child) {
    return removeNode(child, nodeId);
  });
}

function findNode(node, nodeId) {
  if (node.id === nodeId) {
    return node;
  }

  for (let i = 0; i < node.children.length; i += 1) {
    const hit = findNode(node.children[i], nodeId);
    if (hit) {
      return hit;
    }
  }

  return null;
}

function createMapRecord(id, title, tree) {
  const now = new Date().toISOString();
  return {
    id: id,
    title: title,
    createdAt: now,
    updatedAt: now,
    tree: tree || {
      id: ROOT_ID,
      type: "root",
      label: "花卉总图谱",
      children: []
    }
  };
}

function loadMaps() {
  const saved = loadCollection(STORAGE_KEYS.maps, []);
  if (saved.length) {
    return saved.map(sanitizeMapRecord).filter(Boolean);
  }

  const legacy = loadLegacyMap();
  if (legacy) {
    return [legacy];
  }

  return structuredClone(demoMaps);
}

function sanitizeMapRecord(map) {
  if (!map || typeof map !== "object" || !map.id || !map.title || !map.tree) {
    return null;
  }

  return {
    id: String(map.id),
    title: String(map.title),
    createdAt: map.createdAt || new Date().toISOString(),
    updatedAt: map.updatedAt || new Date().toISOString(),
    tree: sanitizeNode(map.tree, true)
  };
}

function sanitizeNode(node, isRoot) {
  return {
    id: String(node.id || crypto.randomUUID()),
    type: isRoot ? "root" : (node.type === "flowerRef" ? "flowerRef" : "text"),
    label: String(node.label || (isRoot ? "花卉总图谱" : "未命名节点")),
    flowerId: node.type === "flowerRef" ? String(node.flowerId || "") : undefined,
    children: Array.isArray(node.children)
      ? node.children.map(function (child) {
        return sanitizeNode(child, false);
      })
      : []
  };
}

function loadLegacyMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.legacyMap);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const migrated = createMapRecord("legacy-map", "默认导图", sanitizeNode(parsed, true));
    localStorage.setItem(STORAGE_KEYS.maps, JSON.stringify([migrated]));
    return migrated;
  } catch (error) {
    return null;
  }
}

function loadCollection(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return structuredClone(fallback);
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(fallback);
  } catch (error) {
    return structuredClone(fallback);
  }
}

function hasStoredLocalCache() {
  return hasNonEmptyCollection(STORAGE_KEYS.flowers) || hasNonEmptyCollection(STORAGE_KEYS.maps) || hasLegacyMapCache();
}

function hasNonEmptyCollection(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function hasLegacyMapCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.legacyMap);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw);
    return Boolean(parsed && typeof parsed === "object");
  } catch {
    return false;
  }
}

function loadUiState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ui);
    if (!raw) {
      return structuredClone(defaultUi);
    }
    const parsed = JSON.parse(raw);
    return {
      activeTab: parsed.activeTab === "map" ? "map" : "list",
      search: parsed.search || "",
      sort: parsed.sort === "recent" ? "recent" : "name",
      listViewMode: parsed.listViewMode === "gallery" ? "gallery" : "grid",
      mapSearch: parsed.mapSearch || "",
      selectedMapId: parsed.selectedMapId || "",
      isMapFullscreen: Boolean(parsed.isMapFullscreen),
      mapViewports: sanitizeViewportMap(parsed.mapViewports)
    };
  } catch (error) {
    return structuredClone(defaultUi);
  }
}

function sanitizeViewportMap(source) {
  const output = {};
  if (!source || typeof source !== "object") {
    return output;
  }

  Object.keys(source).forEach(function (key) {
    const viewport = source[key];
    if (!viewport || typeof viewport !== "object") {
      return;
    }
    output[key] = {
      x: typeof viewport.x === "number" ? viewport.x : DEFAULT_VIEWPORT.x,
      y: typeof viewport.y === "number" ? viewport.y : DEFAULT_VIEWPORT.y,
      scale: typeof viewport.scale === "number" ? viewport.scale : DEFAULT_VIEWPORT.scale
    };
  });

  return output;
}

function persistFlowers() {
  localStorage.setItem(STORAGE_KEYS.flowers, JSON.stringify(state.flowers));
  scheduleCloudSync();
}

function persistMaps() {
  localStorage.setItem(STORAGE_KEYS.maps, JSON.stringify(state.maps));
  scheduleCloudSync();
}

function persistUi() {
  localStorage.setItem(STORAGE_KEYS.ui, JSON.stringify(state.ui));
}

async function hydrateImageCache() {
  const images = await getAllImages();
  state.imageCache = images.reduce(function (acc, item) {
    acc[item.id] = item;
    return acc;
  }, {});
}

async function saveFlowerImage(flower, fileName, mimeType, dataUrl) {
  const imageId = flower.imageId || crypto.randomUUID();
  const record = {
    id: imageId,
    flowerId: flower.id,
    fileName: fileName,
    mimeType: mimeType,
    dataUrl: dataUrl,
    updatedAt: new Date().toISOString()
  };

  await putImage(record);
  state.imageCache[imageId] = record;
  flower.imageId = imageId;
  flower.imageName = fileName;
  flower.imageMimeType = mimeType;
}

async function removeFlowerImage(flower) {
  if (!flower || !flower.imageId) {
    return;
  }

  await deleteImage(flower.imageId);
  delete state.imageCache[flower.imageId];
  flower.imageId = "";
  flower.imageName = "";
  flower.imageMimeType = "";
}

function getImageDb() {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(IMAGE_DB.name, IMAGE_DB.version);

    request.onupgradeneeded = function () {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGE_DB.store)) {
        db.createObjectStore(IMAGE_DB.store, { keyPath: "id" });
      }
    };

    request.onsuccess = function () {
      resolve(request.result);
    };

    request.onerror = function () {
      reject(request.error);
    };
  });
}

async function getAllImages() {
  const db = await getImageDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(IMAGE_DB.store, "readonly");
    const store = tx.objectStore(IMAGE_DB.store);
    const request = store.getAll();

    request.onsuccess = function () {
      resolve(request.result || []);
    };
    request.onerror = function () {
      reject(request.error);
    };
    tx.oncomplete = function () {
      db.close();
    };
  });
}

async function replaceAllImages(images) {
  const db = await getImageDb();
  await new Promise(function (resolve, reject) {
    const tx = db.transaction(IMAGE_DB.store, "readwrite");
    const store = tx.objectStore(IMAGE_DB.store);
    const clearRequest = store.clear();
    clearRequest.onerror = function () {
      reject(clearRequest.error);
    };
    clearRequest.onsuccess = function () {
      images.forEach(function (image) {
        store.put(image);
      });
    };
    tx.oncomplete = function () {
      db.close();
      resolve();
    };
    tx.onerror = function () {
      reject(tx.error);
    };
  });

  state.imageCache = {};
  images.forEach(function (image) {
    state.imageCache[image.id] = image;
  });
}

async function putImage(record) {
  const db = await getImageDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(IMAGE_DB.store, "readwrite");
    const store = tx.objectStore(IMAGE_DB.store);
    const request = store.put(record);

    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function () {
      reject(request.error);
    };
    tx.oncomplete = function () {
      db.close();
    };
  });
}

async function deleteImage(imageId) {
  const db = await getImageDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(IMAGE_DB.store, "readwrite");
    const store = tx.objectStore(IMAGE_DB.store);
    const request = store.delete(imageId);

    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function () {
      reject(request.error);
    };
    tx.oncomplete = function () {
      db.close();
    };
  });
}

function readFileAsDataUrl(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function () {
      reject(reader.error);
    };
    reader.readAsDataURL(file);
  });
}

function getFlowerSwatches(seed) {
  const palette = [
    ["#edafb8", "#f7e1d7"],
    ["#f4c95d", "#f7f7e8"],
    ["#b8d8ba", "#e7f4ea"],
    ["#d6c1f5", "#f6eefe"],
    ["#ffb7a1", "#ffe8df"],
    ["#9dd9d2", "#edf9f7"]
  ];

  let hash = 0;
  const source = String(seed || "");
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
