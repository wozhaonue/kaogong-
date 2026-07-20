const DB_NAME = "chronicles-history-map-v1";
const DB_VERSION = 1;
const UI_KEY = "chronicles-history-map-ui-v1";
const CANVAS_MIN_WIDTH = 3400;

const demoTimelines = [
  {
    id: crypto.randomUUID(),
    title: "Fashion History",
    icon: "checkroom",
    createdAt: "2026-07-12T08:00:00.000Z",
    updatedAt: "2026-07-20T08:00:00.000Z"
  },
  {
    id: crypto.randomUUID(),
    title: "Art Movements",
    icon: "palette",
    createdAt: "2026-07-12T08:20:00.000Z",
    updatedAt: "2026-07-20T08:40:00.000Z"
  },
  {
    id: crypto.randomUUID(),
    title: "Documents",
    icon: "description",
    createdAt: "2026-07-12T09:00:00.000Z",
    updatedAt: "2026-07-19T17:10:00.000Z"
  }
];

const demoImageIds = {
  renaissance: crypto.randomUUID(),
  mannerism: crypto.randomUUID(),
  silhouette: crypto.randomUUID(),
  manuscript: crypto.randomUUID()
};

const demoEvents = [
  {
    id: crypto.randomUUID(),
    timelineId: demoTimelines[1].id,
    x: 820,
    time: "14th Century",
    name: "The Renaissance Begins",
    dynasty: "Renaissance",
    imageId: demoImageIds.renaissance,
    artifactName: "Workshop Studies and Patronage",
    description:
      "A fervent period of European cultural, artistic, political and economic rebirth. Humanist inquiry, new workshop systems and court patronage reshaped painting, sculpture and scholarship.",
    createdAt: "2026-07-18T07:00:00.000Z",
    updatedAt: "2026-07-20T08:20:00.000Z"
  },
  {
    id: crypto.randomUUID(),
    timelineId: demoTimelines[1].id,
    x: 1500,
    time: "1504",
    name: "Mannerism Emerges",
    dynasty: "Late Renaissance",
    imageId: demoImageIds.mannerism,
    artifactName: "Stylized Compositions",
    description:
      "Artists began pushing beyond classical balance into heightened poses, elongated bodies and charged spiritual tension. The shift marks a change in taste rather than a new chronological band.",
    createdAt: "2026-07-18T10:10:00.000Z",
    updatedAt: "2026-07-19T15:00:00.000Z"
  },
  {
    id: crypto.randomUUID(),
    timelineId: demoTimelines[0].id,
    x: 900,
    time: "Han Dynasty",
    name: "Deep Sleeves and Layered Robes",
    dynasty: "Han",
    imageId: demoImageIds.silhouette,
    artifactName: "Shenyi",
    description:
      "The robe silhouette favored generous sleeves and wrapped construction, leaving a strong visual vocabulary for later ceremonial dress and theatrical revival.",
    createdAt: "2026-07-15T09:00:00.000Z",
    updatedAt: "2026-07-20T07:50:00.000Z"
  },
  {
    id: crypto.randomUUID(),
    timelineId: demoTimelines[2].id,
    x: 1160,
    time: "c. 868",
    name: "Diamond Sutra Printing",
    dynasty: "Tang",
    imageId: demoImageIds.manuscript,
    artifactName: "Woodblock Print Scroll",
    description:
      "One of the earliest complete, dated printed books. Its survival offers a precise archival anchor for the history of textual reproduction and circulation.",
    createdAt: "2026-07-17T13:20:00.000Z",
    updatedAt: "2026-07-19T13:20:00.000Z"
  }
];

const demoImages = [
  {
    id: demoImageIds.renaissance,
    mimeType: "image/svg+xml",
    width: 1400,
    height: 900,
    data: createPlaceholderImage({
      title: "Renaissance",
      subtitle: "Workshop & Humanism",
      top: "#5c2d23",
      bottom: "#cab28d"
    })
  },
  {
    id: demoImageIds.mannerism,
    mimeType: "image/svg+xml",
    width: 1400,
    height: 900,
    data: createPlaceholderImage({
      title: "Mannerism",
      subtitle: "Stylized Tension",
      top: "#73393a",
      bottom: "#d4bf9f"
    })
  },
  {
    id: demoImageIds.silhouette,
    mimeType: "image/svg+xml",
    width: 1400,
    height: 900,
    data: createPlaceholderImage({
      title: "Han Robes",
      subtitle: "Layered Sleeves",
      top: "#6c4651",
      bottom: "#d9ccb8"
    })
  },
  {
    id: demoImageIds.manuscript,
    mimeType: "image/svg+xml",
    width: 1400,
    height: 900,
    data: createPlaceholderImage({
      title: "Printed Scroll",
      subtitle: "Archival Witness",
      top: "#8a5c38",
      bottom: "#ead8b7"
    })
  }
];

const defaultUiState = {
  selectedTimelineId: "",
  mode: "display",
  search: "",
  scrollLeft: 520
};

const state = {
  db: null,
  timelines: [],
  events: [],
  images: new Map(),
  ui: loadUiState(),
  currentDetailId: "",
  sheetOpenForEventId: null,
  pendingX: null,
  pendingImage: null,
  confirmAction: null,
  dragging: false,
  dragStartX: 0,
  dragStartScrollLeft: 0
};

const dom = {
  searchInput: document.getElementById("search-input"),
  modeEdit: document.getElementById("mode-edit"),
  modeDisplay: document.getElementById("mode-display"),
  renameTimeline: document.getElementById("rename-timeline"),
  settingsButton: document.getElementById("settings-button"),
  returnEntryDesktop: document.getElementById("return-entry-desktop"),
  returnEntryMobile: document.getElementById("return-entry-mobile"),
  sidebar: document.getElementById("sidebar"),
  timelineList: document.getElementById("timeline-list"),
  newTimeline: document.getElementById("new-timeline"),
  mobileSidebarToggle: document.getElementById("mobile-sidebar-toggle"),
  showHelp: document.getElementById("show-help"),
  timelineTitle: document.getElementById("timeline-title"),
  timelineSubtitle: document.getElementById("timeline-subtitle"),
  timelineScroll: document.getElementById("timeline-scroll"),
  timelineCanvas: document.getElementById("timeline-canvas"),
  timelineEvents: document.getElementById("timeline-events"),
  legendCopy: document.getElementById("legend-copy"),
  eventSheet: document.getElementById("event-sheet"),
  eventForm: document.getElementById("event-form"),
  eventSheetTitle: document.getElementById("event-sheet-title"),
  eventName: document.getElementById("event-name"),
  eventTime: document.getElementById("event-time"),
  eventDynasty: document.getElementById("event-dynasty"),
  eventArtifact: document.getElementById("event-artifact"),
  eventDescription: document.getElementById("event-description"),
  eventImage: document.getElementById("event-image"),
  uploadImage: document.getElementById("upload-image"),
  uploadPlaceholder: document.getElementById("upload-placeholder"),
  deleteEvent: document.getElementById("delete-event"),
  detailModal: document.getElementById("detail-modal"),
  detailEdit: document.getElementById("detail-edit"),
  detailClose: document.getElementById("detail-close"),
  detailImage: document.getElementById("detail-image"),
  detailDynastyBadge: document.getElementById("detail-dynasty-badge"),
  detailTimeBadge: document.getElementById("detail-time-badge"),
  detailTitle: document.getElementById("detail-title"),
  detailDescription: document.getElementById("detail-description"),
  detailQuote: document.getElementById("detail-quote"),
  detailMeta: document.getElementById("detail-meta"),
  confirmModal: document.getElementById("confirm-modal"),
  confirmForm: document.getElementById("confirm-form"),
  confirmTitle: document.getElementById("confirm-title"),
  confirmMessage: document.getElementById("confirm-message"),
  renameModal: document.getElementById("rename-modal"),
  renameForm: document.getElementById("rename-form"),
  renameInput: document.getElementById("rename-input"),
  toastStack: document.getElementById("toast-stack")
};

window.addEventListener("DOMContentLoaded", bootstrap);

async function bootstrap() {
  state.db = await openDatabase();
  await seedDatabaseIfNeeded();
  await loadAllData();
  bootstrapSelections();
  bindEvents();
  render();
}

function bindEvents() {
  dom.searchInput.addEventListener("input", () => {
    state.ui.search = dom.searchInput.value.trim();
    persistUiState();
    render();
  });

  [dom.modeEdit, dom.modeDisplay].forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.mode = button.dataset.mode;
      persistUiState();
      renderMode();
      renderTimeline();
      showToast(state.ui.mode === "edit" ? "切换到编辑模式" : "切换到展示模式");
    });
  });

  dom.newTimeline.addEventListener("click", createTimeline);
  dom.renameTimeline.addEventListener("click", openRenameModal);
  dom.mobileSidebarToggle.addEventListener("click", () => dom.sidebar.classList.toggle("is-open"));
  dom.showHelp.addEventListener("click", () => {
    showToast("拖拽时间轴可扩展浏览范围；编辑模式下点击轴线可新增事件。");
  });
  dom.settingsButton.addEventListener("click", () => {
    showToast("时间轴不设置年代刻度，事件位置由你的点击坐标直接决定。");
  });

  [dom.returnEntryDesktop, dom.returnEntryMobile].forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "../../index.html";
    });
  });

  dom.timelineScroll.addEventListener("mousedown", startDragScroll);
  window.addEventListener("mousemove", onDragScroll);
  window.addEventListener("mouseup", stopDragScroll);
  dom.timelineScroll.addEventListener("scroll", () => {
    state.ui.scrollLeft = dom.timelineScroll.scrollLeft;
    persistUiState();
  });

  dom.timelineEvents.addEventListener("click", handleTimelineClick);

  dom.eventImage.addEventListener("change", handleImageSelection);
  dom.eventForm.addEventListener("submit", handleEventSubmit);
  dom.deleteEvent.addEventListener("click", requestDeleteEvent);

  dom.detailClose.addEventListener("click", () => dom.detailModal.close());
  dom.detailEdit.addEventListener("click", () => {
    dom.detailModal.close();
    openEventSheet(state.currentDetailId);
  });

  dom.confirmForm.addEventListener("submit", handleConfirmSubmit);
  dom.renameForm.addEventListener("submit", handleRenameSubmit);

  [dom.eventSheet, dom.confirmModal, dom.renameModal, dom.detailModal].forEach((dialog) => {
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      dialog.close();
    });
  });
}

function render() {
  dom.searchInput.value = state.ui.search;
  renderMode();
  renderTimelineList();
  renderTimelineHeading();
  renderTimeline();
  dom.timelineScroll.scrollLeft = state.ui.scrollLeft;
}

function renderMode() {
  dom.modeEdit.classList.toggle("is-active", state.ui.mode === "edit");
  dom.modeDisplay.classList.toggle("is-active", state.ui.mode === "display");
  dom.legendCopy.textContent =
    state.ui.mode === "edit"
      ? "Drag horizontally to navigate. Click the gold axis to create an event."
      : "Drag horizontally to navigate the timeline archive.";
}

function renderTimelineList() {
  dom.timelineList.innerHTML = "";
  state.timelines.forEach((timeline) => {
    const eventsCount = state.events.filter((event) => event.timelineId === timeline.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `timeline-item${timeline.id === state.ui.selectedTimelineId ? " is-active" : ""}`;
    button.innerHTML = `
      <div class="timeline-item-head">
        <span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(timeline.icon || "history_edu")}</span>
        <span>${escapeHtml(timeline.title)}</span>
      </div>
      <p class="timeline-item-note">${eventsCount} records</p>
    `;
    button.addEventListener("click", () => {
      state.ui.selectedTimelineId = timeline.id;
      persistUiState();
      dom.sidebar.classList.remove("is-open");
      render();
    });
    dom.timelineList.append(button);
  });
}

function renderTimelineHeading() {
  const timeline = getSelectedTimeline();
  const count = getFilteredEvents().length;
  dom.timelineTitle.textContent = timeline?.title || "Chronicles";
  dom.timelineSubtitle.textContent =
    state.ui.mode === "edit"
      ? `${count} 条事件已归档，可在轴线上继续添加或编辑。`
      : `${count} 条事件正在展示，可点击卡片查看详细档案。`;
}

function renderTimeline() {
  dom.timelineEvents.innerHTML = "";
  const timeline = getSelectedTimeline();
  if (!timeline) {
    dom.timelineEvents.append(createEmptyState("尚无时间轴", "请先创建第一条历史时间轴。"));
    return;
  }

  const events = getFilteredEvents();
  if (!events.length) {
    dom.timelineEvents.append(
      createEmptyState(
        state.ui.mode === "edit" ? "点击时间轴创建第一条事件" : "当前筛选下没有可展示的事件",
        state.ui.mode === "edit"
          ? "时间轴本身没有刻度区间，事件位置由你点击的轴线上坐标决定。"
          : "尝试清空搜索词，或切换到另一条时间轴。"
      )
    );
    return;
  }

  const canvasWidth = Math.max(CANVAS_MIN_WIDTH, Math.max(...events.map((item) => item.x)) + 600);
  dom.timelineCanvas.style.width = `${canvasWidth}px`;
  dom.timelineCanvas.style.minWidth = `${canvasWidth}px`;

  events.forEach((record, index) => {
    const featured = index % 2 === 0;
    const above = index % 3 !== 2;

    const shell = document.createElement("article");
    shell.className = "timeline-event-shell";
    shell.style.position = "absolute";
    shell.style.left = `${record.x}px`;
    shell.style.top = "56%";
    shell.style.transform = "translate(-50%, -50%)";

    const nodeButton = document.createElement("button");
    nodeButton.type = "button";
    nodeButton.className = `event-node-button event-node${featured ? " is-featured" : ""}${state.ui.mode === "edit" ? " is-editable" : ""}`;
    nodeButton.dataset.eventId = record.id;
    if (featured) {
      nodeButton.innerHTML = '<span class="event-dot-core" aria-hidden="true"></span>';
    }
    shell.append(nodeButton);

    if (featured) {
      const stub = document.createElement("div");
      stub.className = `event-stub ${above ? "above" : "below"}`;
      stub.style.height = above ? "72px" : "56px";
      shell.append(stub);

      const cardButton = document.createElement("button");
      cardButton.type = "button";
      cardButton.className = `event-card-button event-card ${above ? "above" : "below"}`;
      cardButton.dataset.eventId = record.id;
      cardButton.innerHTML = `
        <div class="event-card-image">
          <img src="${escapeAttribute(getImageSrc(record.imageId))}" alt="${escapeAttribute(record.name)}" />
        </div>
        <span class="event-card-era">${escapeHtml(record.time)}</span>
        <h3>${escapeHtml(record.name)}</h3>
        <p>${escapeHtml(truncate(record.description || record.artifactName || "暂无补充说明。", 112))}</p>
      `;
      shell.append(cardButton);
    } else {
      const tag = document.createElement("div");
      tag.className = `event-time-tag ${above ? "below" : "above"}`;
      tag.textContent = record.time;
      shell.append(tag);
    }

    dom.timelineEvents.append(shell);
  });
}

function handleTimelineClick(event) {
  const trigger = event.target.closest("[data-event-id]");
  if (trigger) {
    const eventId = trigger.dataset.eventId;
    if (state.ui.mode === "display") {
      openDetailModal(eventId);
    } else {
      openEventSheet(eventId);
    }
    return;
  }

  if (state.ui.mode !== "edit") {
    return;
  }

  const rect = dom.timelineCanvas.getBoundingClientRect();
  const axisTop = rect.height * 0.56;
  if (Math.abs(event.clientY - rect.top - axisTop) > 80) {
    return;
  }

  state.pendingX = Math.max(120, Math.min(event.clientX - rect.left, rect.width - 120));
  openEventSheet();
}

function openEventSheet(eventId = null) {
  state.sheetOpenForEventId = eventId;
  state.pendingImage = null;
  dom.eventImage.value = "";
  const record = state.events.find((item) => item.id === eventId);
  dom.eventSheetTitle.textContent = record ? "Edit Event" : "New Event";
  dom.eventName.value = record?.name || "";
  dom.eventTime.value = record?.time || "";
  dom.eventDynasty.value = record?.dynasty || "";
  dom.eventArtifact.value = record?.artifactName || "";
  dom.eventDescription.value = record?.description || "";
  dom.deleteEvent.hidden = !record;
  renderUploadPreview(record?.imageId || "");
  dom.eventSheet.showModal();
}

function renderUploadPreview(imageId) {
  const src = state.pendingImage?.dataUrl || (imageId ? getImageSrc(imageId) : "");
  if (!src) {
    dom.uploadImage.hidden = true;
    dom.uploadPlaceholder.hidden = false;
    dom.uploadImage.removeAttribute("src");
    return;
  }
  dom.uploadImage.src = src;
  dom.uploadImage.hidden = false;
  dom.uploadPlaceholder.hidden = true;
}

async function handleImageSelection() {
  const file = dom.eventImage.files?.[0];
  if (!file) {
    return;
  }
  const dataUrl = await fileToDataUrl(file);
  state.pendingImage = {
    id: crypto.randomUUID(),
    mimeType: file.type || "image/*",
    width: 0,
    height: 0,
    dataUrl
  };
  renderUploadPreview("");
}

async function handleEventSubmit(event) {
  if (event.submitter?.value === "cancel") {
    dom.eventSheet.close();
    return;
  }
  event.preventDefault();

  const payload = {
    time: dom.eventTime.value.trim(),
    name: dom.eventName.value.trim(),
    dynasty: dom.eventDynasty.value.trim(),
    artifactName: dom.eventArtifact.value.trim(),
    description: dom.eventDescription.value.trim()
  };

  if (!payload.time || !payload.name) {
    showToast("保存前请填写时间与事件名。", "warning");
    (!payload.name ? dom.eventName : dom.eventTime).focus();
    return;
  }

  const timeline = getSelectedTimeline();
  if (!timeline) {
    return;
  }

  let imageId = state.events.find((item) => item.id === state.sheetOpenForEventId)?.imageId || "";
  if (state.pendingImage) {
    imageId = state.pendingImage.id;
    await putRecord("images", {
      id: imageId,
      mimeType: state.pendingImage.mimeType,
      width: state.pendingImage.width,
      height: state.pendingImage.height,
      data: state.pendingImage.dataUrl
    });
  }

  const now = new Date().toISOString();
  if (state.sheetOpenForEventId) {
    const current = state.events.find((item) => item.id === state.sheetOpenForEventId);
    await putRecord("events", {
      ...current,
      ...payload,
      imageId,
      updatedAt: now
    });
    showToast(`已更新事件《${payload.name}》。`);
  } else {
    await putRecord("events", {
      id: crypto.randomUUID(),
      timelineId: timeline.id,
      x: state.pendingX ?? state.ui.scrollLeft + 680,
      imageId,
      createdAt: now,
      updatedAt: now,
      ...payload
    });
    showToast(`已新增事件《${payload.name}》。`);
  }

  await touchTimeline(timeline.id);
  await loadAllData();
  dom.eventSheet.close();
  render();
}

function requestDeleteEvent() {
  const record = state.events.find((item) => item.id === state.sheetOpenForEventId);
  if (!record) {
    return;
  }
  openConfirm({
    title: "Delete Event",
    message: `确定删除事件“${record.name}”吗？`,
    action: async () => {
      await deleteRecord("events", record.id);
      await touchTimeline(record.timelineId);
      await loadAllData();
      dom.eventSheet.close();
      render();
      showToast(`已删除事件《${record.name}》。`);
    }
  });
}

function openDetailModal(eventId) {
  const record = state.events.find((item) => item.id === eventId);
  if (!record) {
    return;
  }
  state.currentDetailId = eventId;
  dom.detailImage.src = getImageSrc(record.imageId);
  dom.detailDynastyBadge.textContent = record.dynasty || "Historical Archive";
  dom.detailTimeBadge.textContent = record.time;
  dom.detailTitle.textContent = record.name;
  dom.detailDescription.textContent = record.description || record.artifactName || "这条记录尚未补充详细说明。";
  dom.detailQuote.textContent =
    record.artifactName
      ? `“${record.artifactName}”可作为理解该事件的核心物证或关联对象。`
      : "“该事件当前以时间与名称为核心记录，后续可继续补充文献、器物与图像档案。”";
  dom.detailMeta.innerHTML = "";
  [
    record.dynasty ? `Dynasty: ${record.dynasty}` : "",
    record.artifactName ? `Artifact: ${record.artifactName}` : "",
    `Recorded: ${formatDateTime(record.updatedAt)}`
  ]
    .filter(Boolean)
    .forEach((text) => {
      const chip = document.createElement("span");
      chip.className = "meta-chip";
      chip.textContent = text;
      dom.detailMeta.append(chip);
    });
  dom.detailModal.showModal();
}

function openRenameModal() {
  const timeline = getSelectedTimeline();
  if (!timeline) {
    return;
  }
  dom.renameInput.value = timeline.title;
  dom.renameModal.showModal();
}

async function handleRenameSubmit(event) {
  if (event.submitter?.value === "cancel") {
    dom.renameModal.close();
    return;
  }
  event.preventDefault();
  const timeline = getSelectedTimeline();
  if (!timeline) {
    return;
  }
  const title = dom.renameInput.value.trim();
  if (!title) {
    dom.renameInput.focus();
    return;
  }
  await putRecord("timelines", {
    ...timeline,
    title,
    updatedAt: new Date().toISOString()
  });
  await loadAllData();
  dom.renameModal.close();
  render();
  showToast(`时间轴已重命名为《${title}》。`);
}

function openConfirm({ title, message, action }) {
  state.confirmAction = action;
  dom.confirmTitle.textContent = title;
  dom.confirmMessage.textContent = message;
  dom.confirmModal.showModal();
}

async function handleConfirmSubmit(event) {
  if (event.submitter?.value === "cancel") {
    state.confirmAction = null;
    dom.confirmModal.close();
    return;
  }
  event.preventDefault();
  const action = state.confirmAction;
  state.confirmAction = null;
  dom.confirmModal.close();
  if (typeof action === "function") {
    await action();
  }
}

async function createTimeline() {
  const title = `New Timeline ${state.timelines.length + 1}`;
  const record = {
    id: crypto.randomUUID(),
    title,
    icon: pickTimelineIcon(state.timelines.length),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await putRecord("timelines", record);
  await loadAllData();
  state.ui.selectedTimelineId = record.id;
  persistUiState();
  render();
  showToast(`已创建时间轴《${title}》。`);
}

function startDragScroll(event) {
  if (event.target.closest("button, input, textarea, label")) {
    return;
  }
  state.dragging = true;
  state.dragStartX = event.pageX;
  state.dragStartScrollLeft = dom.timelineScroll.scrollLeft;
  dom.timelineScroll.classList.add("is-dragging");
}

function onDragScroll(event) {
  if (!state.dragging) {
    return;
  }
  event.preventDefault();
  const walk = (event.pageX - state.dragStartX) * 1.35;
  dom.timelineScroll.scrollLeft = state.dragStartScrollLeft - walk;
}

function stopDragScroll() {
  if (!state.dragging) {
    return;
  }
  state.dragging = false;
  dom.timelineScroll.classList.remove("is-dragging");
}

function getSelectedTimeline() {
  return state.timelines.find((item) => item.id === state.ui.selectedTimelineId) || null;
}

function getFilteredEvents() {
  const timeline = getSelectedTimeline();
  if (!timeline) {
    return [];
  }
  const query = normalize(state.ui.search);
  return state.events
    .filter((item) => item.timelineId === timeline.id)
    .filter((item) => {
      if (!query) {
        return true;
      }
      return normalize([item.time, item.name, item.dynasty, item.artifactName, item.description].join(" ")).includes(query);
    })
    .sort((a, b) => a.x - b.x);
}

async function loadAllData() {
  state.timelines = (await getAllRecords("timelines")).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  state.events = await getAllRecords("events");
  state.images = new Map((await getAllRecords("images")).map((item) => [item.id, item]));
}

function bootstrapSelections() {
  if (!state.ui.selectedTimelineId || !state.timelines.some((item) => item.id === state.ui.selectedTimelineId)) {
    state.ui.selectedTimelineId = state.timelines[0]?.id || "";
  }
  if (!["edit", "display"].includes(state.ui.mode)) {
    state.ui.mode = "display";
  }
}

function loadUiState() {
  try {
    const raw = localStorage.getItem(UI_KEY);
    return raw ? { ...defaultUiState, ...JSON.parse(raw) } : structuredClone(defaultUiState);
  } catch {
    return structuredClone(defaultUiState);
  }
}

function persistUiState() {
  localStorage.setItem(UI_KEY, JSON.stringify(state.ui));
}

function showToast(message, tone = "info") {
  const toast = document.createElement("article");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="material-symbols-outlined toast-icon" aria-hidden="true">${tone === "warning" ? "warning" : "check_circle"}</span>
    <div>
      <p class="toast-title">${tone === "warning" ? "提示" : "已完成"}</p>
      <p class="toast-message">${escapeHtml(message)}</p>
    </div>
  `;
  dom.toastStack.append(toast);
  window.setTimeout(() => {
    if (toast.isConnected) {
      toast.remove();
    }
  }, 2600);
}

async function touchTimeline(timelineId) {
  const timeline = state.timelines.find((item) => item.id === timelineId);
  if (!timeline) {
    return;
  }
  await putRecord("timelines", {
    ...timeline,
    updatedAt: new Date().toISOString()
  });
}

function getImageSrc(imageId) {
  return state.images.get(imageId)?.data || createPlaceholderImage({
    title: "Chronicles",
    subtitle: "Visual Archive",
    top: "#7d5b45",
    bottom: "#d8c7a8"
  });
}

function createEmptyState(title, copy) {
  const shell = document.createElement("div");
  shell.className = "empty-hint";
  shell.innerHTML = `
    <article class="empty-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(copy)}</p>
    </article>
  `;
  return shell;
}

function pickTimelineIcon(index) {
  return ["history_edu", "palette", "description", "military_tech", "temple_buddhist"][index % 5];
}

function truncate(value, length) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
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
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function createPlaceholderImage({ title, subtitle, top, bottom }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${top}" />
          <stop offset="100%" stop-color="${bottom}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="760" fill="url(#g)" />
      <rect x="66" y="66" width="1068" height="628" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2" />
      <circle cx="278" cy="260" r="112" fill="rgba(255,255,255,0.16)" />
      <circle cx="902" cy="490" r="144" fill="rgba(65,0,7,0.10)" />
      <text x="110" y="590" fill="rgba(255,255,255,0.9)" font-family="Playfair Display, serif" font-size="82" font-weight="700">${escapeSvg(title)}</text>
      <text x="112" y="648" fill="rgba(255,255,255,0.88)" font-family="Inter, sans-serif" font-size="30" letter-spacing="4">${escapeSvg(subtitle)}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("timelines")) {
        db.createObjectStore("timelines", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("events")) {
        const store = db.createObjectStore("events", { keyPath: "id" });
        store.createIndex("timelineId", "timelineId", { unique: false });
      }
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function seedDatabaseIfNeeded() {
  if ((await getAllRecords("timelines")).length) {
    return;
  }
  await Promise.all([
    ...demoTimelines.map((item) => putRecord("timelines", item)),
    ...demoEvents.map((item) => putRecord("events", item)),
    ...demoImages.map((item) => putRecord("images", item))
  ]);
}

function getAllRecords(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putRecord(storeName, value) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteRecord(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
