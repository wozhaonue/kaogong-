const STORAGE_KEY = "china-gis-atlas-state-v1";
const DATA_VERSION = "2026-07-15-1";
const CHINA_BOUNDS = [
  [73, 18],
  [135, 54]
];

const themeTokens = {
  "terrain-atlas": {
    provinceFill: "#b8a886",
    provinceOutline: "#735a38",
    label: "#241c11",
    river: "#3f6c7d",
    lake: "#6fa6b2",
    terrainOpacity: 0.46,
    background: "#d4c8b1"
  },
  "natural-water": {
    provinceFill: "#b8c4aa",
    provinceOutline: "#4d5a43",
    label: "#1c2518",
    river: "#2f7b8f",
    lake: "#5aafb8",
    terrainOpacity: 0.32,
    background: "#c7d0c0"
  },
  "relief-contrast": {
    provinceFill: "#c8b489",
    provinceOutline: "#5f4726",
    label: "#1f160b",
    river: "#245f77",
    lake: "#4e95a6",
    terrainOpacity: 0.58,
    background: "#d0c0a4"
  }
};

const state = loadState();
let map;
let popup;
let cities = [];
let currentPreview = [];
let selectedCity = null;
const featureMarkers = new Map();

const dom = {
  citySearch: document.getElementById("city-search"),
  cityResults: document.getElementById("city-results"),
  drawIndicator: document.getElementById("draw-mode-indicator"),
  featureType: document.getElementById("feature-type"),
  featureName: document.getElementById("feature-name"),
  featureDescription: document.getElementById("feature-description"),
  finishDrawing: document.getElementById("finish-drawing"),
  cancelDrawing: document.getElementById("cancel-drawing"),
  startDrawing: document.getElementById("start-drawing"),
  mountainList: document.getElementById("mountain-list"),
  riverList: document.getElementById("river-list"),
  lakeList: document.getElementById("lake-list"),
  themeSelect: document.getElementById("theme-select"),
  helperText: document.querySelector(".helper-text")
};

async function init() {
  const [provinces, rivers, lakes, terrainBounds, cityIndex] = await Promise.all([
    fetch(dataUrl("provinces.geojson")).then((r) => r.json()),
    fetch(dataUrl("rivers.geojson")).then((r) => r.json()),
    fetch(dataUrl("lakes.geojson")).then((r) => r.json()),
    fetch(dataUrl("terrain-bounds.json")).then((r) => r.json()),
    fetch(dataUrl("cities.json")).then((r) => r.json())
  ]);

  cities = cityIndex;
  window.__atlasDebug = {
    getCities: () => cities,
    getState: () => structuredClone({
      selectedFeatureId: state.selectedFeatureId,
      theme: state.theme,
      userFeatures: state.userFeatures
    })
  };
  dom.themeSelect.value = state.theme;

  map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": themeTokens[state.theme].background
          }
        }
      ]
    },
    center: [104.5, 35.4],
    zoom: 3.15,
    minZoom: 2.8,
    maxZoom: 8.4,
    maxBounds: [
      [67, 14],
      [139, 57]
    ],
    dragRotate: false,
    touchPitch: false,
    attributionControl: false
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

  popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 14
  });

  map.on("load", () => {
    addBaseSources({ provinces, rivers, lakes, terrainBounds });
    addBaseLayers();
    bindMapEvents();
    syncPreviewSource();
    syncUserFeatureSources();
    applyTheme(state.theme);
    renderFeatureLists();
  });

  bindUi();
  renderCityResults([]);
}

function addBaseSources({ provinces, rivers, lakes, terrainBounds }) {
  map.addSource("terrain-relief", {
    type: "image",
    url: dataUrl("terrain-relief.webp"),
    coordinates: terrainBounds
  });

  map.addSource("provinces", { type: "geojson", data: provinces });
  map.addSource("rivers", { type: "geojson", data: rivers });
  map.addSource("lakes", { type: "geojson", data: lakes });
  map.addSource("city-highlight", {
    type: "geojson",
    data: emptyFeatureCollection()
  });
  map.addSource("user-mountain", {
    type: "geojson",
    data: emptyFeatureCollection()
  });
  map.addSource("user-river", {
    type: "geojson",
    data: emptyFeatureCollection()
  });
  map.addSource("user-lake", {
    type: "geojson",
    data: emptyFeatureCollection()
  });
  map.addSource("selection-highlight", {
    type: "geojson",
    data: emptyFeatureCollection()
  });
  map.addSource("drawing-preview", {
    type: "geojson",
    data: emptyFeatureCollection()
  });
}

function addBaseLayers() {
  map.addLayer({
    id: "terrain-hillshade",
    type: "raster",
    source: "terrain-relief",
    paint: {
      "raster-opacity": themeTokens[state.theme].terrainOpacity,
      "raster-saturation": -0.2,
      "raster-contrast": 0.18
    }
  });

  map.addLayer({
    id: "province-fill",
    type: "fill",
    source: "provinces",
    paint: {
      "fill-color": themeTokens[state.theme].provinceFill,
      "fill-opacity": 0.7
    }
  });

  map.addLayer({
    id: "lake-layer",
    type: "fill",
    source: "lakes",
    paint: {
      "fill-color": themeTokens[state.theme].lake,
      "fill-opacity": 0.66,
      "fill-outline-color": "#bad7da"
    }
  });

  map.addLayer({
    id: "river-layer",
    type: "line",
    source: "rivers",
    paint: {
      "line-color": themeTokens[state.theme].river,
      "line-width": [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "scalerank"], 10],
        0, 2.5,
        4, 1.8,
        10, 0.9
      ],
      "line-opacity": 0.78
    }
  });

  map.addLayer({
    id: "province-boundary",
    type: "line",
    source: "provinces",
    paint: {
      "line-color": themeTokens[state.theme].provinceOutline,
      "line-width": 1.2,
      "line-opacity": 0.78
    }
  });

  map.addLayer({
    id: "province-label",
    type: "symbol",
    source: "provinces",
    layout: {
      "text-field": ["get", "shortName"],
      "text-size": 12,
      "text-font": ["Open Sans Semibold"],
      "text-letter-spacing": 0.08
    },
    paint: {
      "text-color": themeTokens[state.theme].label,
      "text-halo-color": "rgba(255,249,238,0.9)",
      "text-halo-width": 1.3
    }
  });

  map.addLayer({
    id: "user-lake-fill",
    type: "fill",
    source: "user-lake",
    paint: {
      "fill-color": "#3f8ea7",
      "fill-opacity": 0.42,
      "fill-outline-color": "#d8f1ff"
    }
  });

  map.addLayer({
    id: "user-river-line",
    type: "line",
    source: "user-river",
    paint: {
      "line-color": "#82d3ea",
      "line-width": 4,
      "line-blur": 0.4
    }
  });

  map.addLayer({
    id: "user-mountain-shadow",
    type: "circle",
    source: "user-mountain",
    paint: {
      "circle-radius": 14,
      "circle-color": "rgba(72, 50, 31, 0.16)",
      "circle-blur": 0.7,
      "circle-translate": [0, 2]
    }
  });

  map.addLayer({
    id: "user-mountain-point",
    type: "symbol",
    source: "user-mountain",
    layout: {
      "text-field": "▲",
      "text-size": 18,
      "text-font": ["Open Sans Bold"]
    },
    paint: {
      "text-color": "#6a4833",
      "text-halo-color": "#f3dbc1",
      "text-halo-width": 1.1
    }
  });

  map.addLayer({
    id: "feature-labels",
    type: "symbol",
    source: "user-mountain",
    layout: {
      "text-field": ["get", "name"],
      "text-size": 13,
      "text-anchor": "top",
      "text-offset": [0, 1.1],
      "text-font": ["Open Sans Semibold"]
    },
    paint: {
      "text-color": "#22170f",
      "text-halo-color": "rgba(255,250,240,0.95)",
      "text-halo-width": 1.2
    }
  });

  map.addLayer({
    id: "river-labels",
    type: "symbol",
    source: "user-river",
    layout: {
      "text-field": ["get", "name"],
      "symbol-placement": "line-center",
      "text-size": 12,
      "text-font": ["Open Sans Regular"]
    },
    paint: {
      "text-color": "#12384a",
      "text-halo-color": "rgba(245,252,255,0.95)",
      "text-halo-width": 1.2
    }
  });

  map.addLayer({
    id: "lake-labels",
    type: "symbol",
    source: "user-lake",
    layout: {
      "text-field": ["get", "name"],
      "text-size": 12,
      "text-font": ["Open Sans Semibold"]
    },
    paint: {
      "text-color": "#123b47",
      "text-halo-color": "rgba(245,252,255,0.95)",
      "text-halo-width": 1.2
    }
  });

  map.addLayer({
    id: "city-highlight-glow",
    type: "circle",
    source: "city-highlight",
    paint: {
      "circle-radius": 18,
      "circle-color": "#ffda89",
      "circle-opacity": 0.24
    }
  });

  map.addLayer({
    id: "city-highlight",
    type: "circle",
    source: "city-highlight",
    paint: {
      "circle-radius": 6,
      "circle-color": "#fff6dc",
      "circle-stroke-color": "#9a6a2a",
      "circle-stroke-width": 2
    }
  });

  map.addLayer({
    id: "selection-highlight-line",
    type: "line",
    source: "selection-highlight",
    paint: {
      "line-color": "#ffe5aa",
      "line-width": 8,
      "line-opacity": 0.9
    },
    filter: ["==", ["geometry-type"], "LineString"]
  });

  map.addLayer({
    id: "selection-highlight-fill",
    type: "fill",
    source: "selection-highlight",
    paint: {
      "fill-color": "#fff0c2",
      "fill-opacity": 0.34,
      "fill-outline-color": "#fff9ea"
    },
    filter: ["==", ["geometry-type"], "Polygon"]
  });

  map.addLayer({
    id: "selection-highlight-point",
    type: "circle",
    source: "selection-highlight",
    paint: {
      "circle-radius": 11,
      "circle-color": "#fff3cb",
      "circle-stroke-color": "#6f4f26",
      "circle-stroke-width": 3
    },
    filter: ["==", ["geometry-type"], "Point"]
  });

  map.addLayer({
    id: "drawing-preview-fill",
    type: "fill",
    source: "drawing-preview",
    paint: {
      "fill-color": "#b8ebfb",
      "fill-opacity": 0.22,
      "fill-outline-color": "#d9fbff"
    },
    filter: ["==", ["geometry-type"], "Polygon"]
  });

  map.addLayer({
    id: "drawing-preview-line",
    type: "line",
    source: "drawing-preview",
    paint: {
      "line-color": "#ffe8b7",
      "line-dasharray": [1.4, 1.2],
      "line-width": 3
    },
    filter: ["!=", ["geometry-type"], "Point"]
  });

  map.addLayer({
    id: "drawing-preview-point",
    type: "circle",
    source: "drawing-preview",
    paint: {
      "circle-radius": 4,
      "circle-color": "#fff6e0"
    },
    filter: ["==", ["geometry-type"], "Point"]
  });
}

function bindMapEvents() {
  map.on("click", (event) => {
    if (!state.drawing.active) {
      return;
    }

    const point = {
      lng: Number(event.lngLat.lng.toFixed(6)),
      lat: Number(event.lngLat.lat.toFixed(6))
    };

    if (state.drawing.type === "mountain") {
      currentPreview = [point];
    } else {
      currentPreview.push(point);
    }
    syncPreviewSource();
    updateDrawIndicator();
  });

  map.on("dblclick", (event) => {
    if (!state.drawing.active || state.drawing.type === "mountain") {
      return;
    }
    event.preventDefault();
    finishDrawing();
  });
}

function bindUi() {
  dom.citySearch.addEventListener("input", () => {
    const query = dom.citySearch.value.trim();
    if (!query) {
      renderCityResults([]);
      return;
    }

    const normalized = query.replace(/\s+/g, "").toLowerCase();
    const matches = cities
      .filter((city) => city.normalizedName.toLowerCase().includes(normalized) || city.name.toLowerCase().includes(normalized))
      .slice(0, 8);

    renderCityResults(matches);
  });

  dom.startDrawing.addEventListener("click", () => {
    startDrawing();
  });

  dom.finishDrawing.addEventListener("click", () => {
    finishDrawing();
  });

  dom.cancelDrawing.addEventListener("click", () => {
    resetDrawing();
  });

  dom.themeSelect.addEventListener("change", () => {
    state.theme = dom.themeSelect.value;
    persistState();
    applyTheme(state.theme);
  });
}

function startDrawingLegacy() {
  const name = dom.featureName.value.trim();
  if (!name) {
    window.alert("请先输入对象名称。");
    return;
  }

  state.drawing.active = true;
  state.drawing.type = dom.featureType.value;
  currentPreview = [];
  syncPreviewSource();
  dom.drawIndicator.textContent = `绘制中：${displayType(state.drawing.type)}`;
}

function finishDrawingLegacy() {
  if (!state.drawing.active) {
    return;
  }

  const type = state.drawing.type;
  const name = dom.featureName.value.trim();
  const description = dom.featureDescription.value.trim();

  if (!name) {
    window.alert("对象名称不能为空。");
    return;
  }

  const requiredPoints = type === "mountain" ? 1 : type === "river" ? 2 : 3;
  if (currentPreview.length < requiredPoints) {
    window.alert(`当前类型至少需要 ${requiredPoints} 个点。`);
    return;
  }

  const feature = {
    id: crypto.randomUUID(),
    type,
    name,
    description,
    points: [...currentPreview],
    createdAt: Date.now()
  };

  state.userFeatures.push(feature);
  state.selectedFeatureId = feature.id;
  persistState();
  syncUserFeatureSources();
  setSelectionHighlight(feature.id);
  renderFeatureLists();
  resetDrawing();
}

function resetDrawingLegacy() {
  state.drawing.active = false;
  state.drawing.type = dom.featureType.value;
  currentPreview = [];
  syncPreviewSource();
  dom.drawIndicator.textContent = "未开始绘制";
}

function syncPreviewSource() {
  if (!map || !map.getSource("drawing-preview")) {
    return;
  }

  const features = [];

  for (const point of currentPreview) {
    features.push(toPointFeature(point, { role: "preview" }));
  }

  if (state.drawing.active && currentPreview.length > 0) {
    if (state.drawing.type === "river" && currentPreview.length >= 2) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: currentPreview.map(({ lng, lat }) => [lng, lat])
        },
        properties: {}
      });
    }

    if (state.drawing.type === "lake" && currentPreview.length >= 3) {
      features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...currentPreview, currentPreview[0]].map(({ lng, lat }) => [lng, lat])]
        },
        properties: {}
      });
    }
  }

  map.getSource("drawing-preview").setData({
    type: "FeatureCollection",
    features
  });
}

function syncUserFeatureSourcesLegacy() {
  if (!map) {
    return;
  }

  const mountains = emptyFeatureCollection();
  const rivers = emptyFeatureCollection();
  const lakes = emptyFeatureCollection();

  for (const feature of state.userFeatures) {
    if (feature.type === "mountain") {
      mountains.features.push(toPointFeature(feature.points[0], { id: feature.id, name: feature.name }));
    }

    if (feature.type === "river") {
      rivers.features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: feature.points.map(({ lng, lat }) => [lng, lat])
        },
        properties: {
          id: feature.id,
          name: feature.name
        }
      });
    }

    if (feature.type === "lake") {
      lakes.features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...feature.points, feature.points[0]].map(({ lng, lat }) => [lng, lat])]
        },
        properties: {
          id: feature.id,
          name: feature.name
        }
      });
    }
  }

  map.getSource("user-mountain").setData(mountains);
  map.getSource("user-river").setData(rivers);
  map.getSource("user-lake").setData(lakes);
}

function renderCityResultsLegacy(items) {
  dom.cityResults.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = dom.citySearch.value.trim() ? "没有匹配结果。" : "输入城市名称后显示候选结果。";
    dom.cityResults.append(li);
    return;
  }

  for (const city of items) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<strong>${city.name}</strong><span class="feature-meta">${city.province} · ${city.lng}, ${city.lat}</span>`;
    button.addEventListener("click", () => {
      focusCity(city);
    });
    li.append(button);
    dom.cityResults.append(li);
  }
}

function focusCityLegacy(city) {
  selectedCity = city;
  map.getSource("city-highlight").setData({
    type: "FeatureCollection",
    features: [
      toPointFeature({ lng: city.lng, lat: city.lat }, {
        name: city.name,
        province: city.province
      })
    ]
  });

  map.easeTo({
    center: [city.lng, city.lat],
    zoom: Math.max(map.getZoom(), 4.8),
    duration: 1200,
    offset: [0, 0]
  });

  popup
    .setLngLat([city.lng, city.lat])
    .setHTML(
      `<div class="city-popup-title">${city.name}</div><div class="city-popup-meta">${city.province}</div>`
    )
    .addTo(map);
}

function renderFeatureLists() {
  renderFeatureList("mountain", dom.mountainList);
  renderFeatureList("river", dom.riverList);
  renderFeatureList("lake", dom.lakeList);
}

function renderFeatureListLegacy(type, target) {
  target.innerHTML = "";
  const features = state.userFeatures.filter((feature) => feature.type === type);

  if (features.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = `暂无${displayType(type)}对象`;
    target.append(li);
    return;
  }

  for (const feature of features) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    if (feature.id === state.selectedFeatureId) {
      button.classList.add("is-active");
    }
    button.innerHTML = `<strong>${feature.name}</strong><span class="feature-meta">${displayType(type)} · ${feature.points.length} point(s)</span>`;
    button.addEventListener("click", () => {
      setSelectionHighlight(feature.id);
      renderFeatureLists();
    });
    li.append(button);
    target.append(li);
  }
}

function setSelectionHighlight(featureId) {
  state.selectedFeatureId = featureId;
  persistState();

  const feature = state.userFeatures.find((item) => item.id === featureId);
  if (!feature) {
    map.getSource("selection-highlight").setData(emptyFeatureCollection());
    return;
  }

  let geojson;
  if (feature.type === "mountain") {
    geojson = {
      type: "FeatureCollection",
      features: [toPointFeature(feature.points[0], { id: feature.id, name: feature.name })]
    };
    map.easeTo({ center: [feature.points[0].lng, feature.points[0].lat], zoom: Math.max(map.getZoom(), 5.4), duration: 900 });
  } else if (feature.type === "river") {
    geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: feature.points.map(({ lng, lat }) => [lng, lat])
        },
        properties: { id: feature.id, name: feature.name }
      }]
    };
    fitFeature(feature.points);
  } else {
    geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...feature.points, feature.points[0]].map(({ lng, lat }) => [lng, lat])]
        },
        properties: { id: feature.id, name: feature.name }
      }]
    };
    fitFeature(feature.points);
  }

  map.getSource("selection-highlight").setData(geojson);
}

function fitFeature(points) {
  const bounds = new maplibregl.LngLatBounds();
  for (const point of points) {
    bounds.extend([point.lng, point.lat]);
  }
  map.fitBounds(bounds, {
    padding: 120,
    duration: 900,
    maxZoom: 6.4
  });
}

function applyTheme(themeName) {
  const theme = themeTokens[themeName];
  map.setPaintProperty("background", "background-color", theme.background);
  map.setPaintProperty("terrain-hillshade", "raster-opacity", theme.terrainOpacity);
  map.setPaintProperty("province-fill", "fill-color", theme.provinceFill);
  map.setPaintProperty("province-boundary", "line-color", theme.provinceOutline);
  map.setPaintProperty("province-label", "text-color", theme.label);
  map.setPaintProperty("river-layer", "line-color", theme.river);
  map.setPaintProperty("lake-layer", "fill-color", theme.lake);
}

function toPointFeature(point, properties = {}) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [point.lng, point.lat]
    },
    properties
  };
}

function emptyFeatureCollection() {
  return {
    type: "FeatureCollection",
    features: []
  };
}

function dataUrl(name) {
  return `./data/${name}?v=${DATA_VERSION}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        selectedFeatureId: null,
        theme: "terrain-atlas",
        userFeatures: [],
        drawing: {
          active: false,
          type: "mountain"
        }
      };
    }

    const parsed = JSON.parse(raw);
    return {
      selectedFeatureId: parsed.selectedFeatureId || null,
      theme: parsed.theme || "terrain-atlas",
      userFeatures: Array.isArray(parsed.userFeatures) ? parsed.userFeatures : [],
      drawing: {
        active: false,
        type: "mountain"
      }
    };
  } catch {
    return {
      selectedFeatureId: null,
      theme: "terrain-atlas",
      userFeatures: [],
      drawing: {
        active: false,
        type: "mountain"
      }
    };
  }
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      selectedFeatureId: state.selectedFeatureId,
      theme: state.theme,
      userFeatures: state.userFeatures
    })
  );
}

function displayTypeLegacy(type) {
  return {
    mountain: "山",
    river: "河流",
    lake: "湖泊"
  }[type];
}

function displayType(type) {
  return {
    mountain: "山",
    river: "河流",
    lake: "湖泊"
  }[type];
}

function updateDrawIndicator() {
  if (!state.drawing.active) {
    dom.drawIndicator.textContent = "未开始绘制";
    return;
  }

  const cityName = selectedCity?.name || "未选城市";
  if (state.drawing.type === "mountain") {
    dom.drawIndicator.textContent = `绘制中：山 · ${cityName} · 点击地图确定位置，再点“完成对象”保存`;
    return;
  }

  dom.drawIndicator.textContent = `绘制中：${displayType(state.drawing.type)} · ${cityName} · 地图点击采点，完成后手动保存`;
}

function startDrawing() {
  const name = dom.featureName.value.trim();
  if (!name) {
    window.alert("请先输入对象名称。");
    return;
  }

  if (!selectedCity) {
    window.alert("请先通过左侧搜索并选中一个城市，再开始添加对象。");
    return;
  }

  state.drawing.active = true;
  state.drawing.type = dom.featureType.value;
  currentPreview = [];
  map.easeTo({
    center: [selectedCity.lng, selectedCity.lat],
    zoom: Math.max(map.getZoom(), 5.2),
    duration: 700
  });
  syncPreviewSource();
  updateDrawIndicator();
}

function finishDrawing() {
  if (!state.drawing.active) {
    return;
  }

  const type = state.drawing.type;
  const name = dom.featureName.value.trim();
  const description = dom.featureDescription.value.trim();

  if (!name) {
    window.alert("对象名称不能为空。");
    return;
  }

  const requiredPoints = type === "mountain" ? 1 : type === "river" ? 2 : 3;
  if (currentPreview.length < requiredPoints) {
    window.alert(`当前类型至少需要 ${requiredPoints} 个点。`);
    return;
  }

  const feature = {
    id: crypto.randomUUID(),
    type,
    name,
    description,
    cityName: selectedCity?.name || null,
    province: selectedCity?.province || null,
    points: [...currentPreview],
    createdAt: Date.now()
  };

  state.userFeatures.push(feature);
  state.selectedFeatureId = feature.id;
  persistState();
  syncUserFeatureSources();
  setSelectionHighlight(feature.id);
  renderFeatureLists();
  resetDrawing();
}

function resetDrawing() {
  state.drawing.active = false;
  state.drawing.type = dom.featureType.value;
  currentPreview = [];
  syncPreviewSource();
  dom.drawIndicator.textContent = "未开始绘制";
}

function syncUserFeatureSources() {
  if (!map) {
    return;
  }

  const mountains = emptyFeatureCollection();
  const rivers = emptyFeatureCollection();
  const lakes = emptyFeatureCollection();

  for (const feature of state.userFeatures) {
    if (feature.type === "mountain") {
      mountains.features.push(toPointFeature(feature.points[0], {
        id: feature.id,
        name: feature.name,
        cityName: feature.cityName || "",
        province: feature.province || ""
      }));
    }

    if (feature.type === "river") {
      rivers.features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: feature.points.map(({ lng, lat }) => [lng, lat])
        },
        properties: {
          id: feature.id,
          name: feature.name,
          cityName: feature.cityName || "",
          province: feature.province || ""
        }
      });
    }

    if (feature.type === "lake") {
      lakes.features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...feature.points, feature.points[0]].map(({ lng, lat }) => [lng, lat])]
        },
        properties: {
          id: feature.id,
          name: feature.name,
          cityName: feature.cityName || "",
          province: feature.province || ""
        }
      });
    }
  }

  map.getSource("user-mountain").setData(mountains);
  map.getSource("user-river").setData(rivers);
  map.getSource("user-lake").setData(lakes);
}

function renderCityResults(items) {
  dom.cityResults.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = dom.citySearch.value.trim() ? "没有匹配结果。" : "输入城市名称后显示候选结果。";
    dom.cityResults.append(li);
    return;
  }

  for (const city of items) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<strong>${city.name}</strong><span class="feature-meta">${city.province} · ${city.lng}, ${city.lat}</span>`;
    button.addEventListener("click", () => {
      focusCity(city);
    });
    li.append(button);
    dom.cityResults.append(li);
  }
}

function focusCity(city) {
  selectedCity = city;
  if (!state.drawing.active && dom.helperText) {
    dom.helperText.textContent = `当前已选城市：${city.name}（${city.province}）。点击“开始绘制”后，将围绕该城市添加山、河流或湖泊。`;
  }

  map.getSource("city-highlight").setData({
    type: "FeatureCollection",
    features: [
      toPointFeature({ lng: city.lng, lat: city.lat }, {
        name: city.name,
        province: city.province
      })
    ]
  });

  map.easeTo({
    center: [city.lng, city.lat],
    zoom: Math.max(map.getZoom(), 4.8),
    duration: 1200,
    offset: [0, 0]
  });

  popup
    .setLngLat([city.lng, city.lat])
    .setHTML(`<div class="city-popup-title">${city.name}</div><div class="city-popup-meta">${city.province}</div>`)
    .addTo(map);
}

function renderFeatureList(type, target) {
  target.innerHTML = "";
  const features = state.userFeatures.filter((feature) => feature.type === type);

  if (features.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = `暂无${displayType(type)}对象`;
    target.append(li);
    return;
  }

  for (const feature of features) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    if (feature.id === state.selectedFeatureId) {
      button.classList.add("is-active");
    }

    const cityMeta = feature.cityName ? `${feature.cityName}${feature.province ? ` · ${feature.province}` : ""}` : "未绑定城市";
    button.innerHTML = `<strong>${feature.name}</strong><span class="feature-meta">${displayType(type)} · ${cityMeta} · ${feature.points.length} point(s)</span>`;
    button.addEventListener("click", () => {
      setSelectionHighlight(feature.id);
      renderFeatureLists();
    });
    li.append(button);
    target.append(li);
  }
}

displayType = function displayType(type) {
  return {
    mountain: "山",
    river: "河流",
    lake: "湖泊"
  }[type];
};

updateDrawIndicator = function updateDrawIndicator() {
  if (!state.drawing.active) {
    dom.drawIndicator.textContent = "未开始绘制";
    return;
  }

  const cityName = selectedCity?.name || "未选城市";
  if (state.drawing.type === "mountain") {
    dom.drawIndicator.textContent = `绘制中：山 · ${cityName} · 点击地图确定位置，再点“完成对象”保存`;
    return;
  }

  dom.drawIndicator.textContent = `绘制中：${displayType(state.drawing.type)} · ${cityName} · 地图点击采点，完成后手动保存`;
};

startDrawing = function startDrawing() {
  const name = dom.featureName.value.trim();
  if (!name) {
    window.alert("请先输入对象名称。");
    return;
  }

  if (!selectedCity) {
    window.alert("请先通过左侧搜索并选中一个城市，再开始添加对象。");
    return;
  }

  state.drawing.active = true;
  state.drawing.type = dom.featureType.value;
  currentPreview = [];
  map.easeTo({
    center: [selectedCity.lng, selectedCity.lat],
    zoom: Math.max(map.getZoom(), 5.2),
    duration: 700
  });
  syncPreviewSource();
  updateDrawIndicator();
};

finishDrawing = function finishDrawing() {
  if (!state.drawing.active) {
    return;
  }

  const type = state.drawing.type;
  const name = dom.featureName.value.trim();
  const description = dom.featureDescription.value.trim();

  if (!name) {
    window.alert("对象名称不能为空。");
    return;
  }

  const requiredPoints = type === "mountain" ? 1 : type === "river" ? 2 : 3;
  if (currentPreview.length < requiredPoints) {
    window.alert(`当前类型至少需要 ${requiredPoints} 个点。`);
    return;
  }

  const feature = {
    id: crypto.randomUUID(),
    type,
    name,
    description,
    cityName: selectedCity?.name || null,
    province: selectedCity?.province || null,
    points: [...currentPreview],
    createdAt: Date.now()
  };

  state.userFeatures.push(feature);
  state.selectedFeatureId = feature.id;
  persistState();
  syncUserFeatureSources();
  setSelectionHighlight(feature.id);
  resetDrawing();
};

resetDrawing = function resetDrawing() {
  state.drawing.active = false;
  state.drawing.type = dom.featureType.value;
  currentPreview = [];
  syncPreviewSource();
  dom.drawIndicator.textContent = "未开始绘制";
};

syncUserFeatureSources = function syncUserFeatureSources() {
  if (!map) {
    return;
  }

  const mountains = emptyFeatureCollection();
  const rivers = emptyFeatureCollection();
  const lakes = emptyFeatureCollection();

  for (const feature of state.userFeatures) {
    if (feature.type === "mountain") {
      mountains.features.push(toPointFeature(feature.points[0], {
        id: feature.id,
        name: feature.name,
        cityName: feature.cityName || "",
        province: feature.province || ""
      }));
    }

    if (feature.type === "river") {
      rivers.features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: feature.points.map(({ lng, lat }) => [lng, lat])
        },
        properties: {
          id: feature.id,
          name: feature.name,
          cityName: feature.cityName || "",
          province: feature.province || ""
        }
      });
    }

    if (feature.type === "lake") {
      lakes.features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...feature.points, feature.points[0]].map(({ lng, lat }) => [lng, lat])]
        },
        properties: {
          id: feature.id,
          name: feature.name,
          cityName: feature.cityName || "",
          province: feature.province || ""
        }
      });
    }
  }

  map.getSource("user-mountain").setData(mountains);
  map.getSource("user-river").setData(rivers);
  map.getSource("user-lake").setData(lakes);
  syncFeatureMarkers();
};

renderCityResults = function renderCityResults(items) {
  dom.cityResults.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = dom.citySearch.value.trim() ? "没有匹配结果。" : "输入城市名称后显示候选结果。";
    dom.cityResults.append(li);
    return;
  }

  for (const city of items) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<strong>${city.name}</strong><span class="feature-meta">${city.province} · ${city.lng}, ${city.lat}</span>`;
    button.addEventListener("click", () => {
      focusCity(city);
    });
    li.append(button);
    dom.cityResults.append(li);
  }
};

focusCity = function focusCity(city) {
  selectedCity = city;
  if (!state.drawing.active && dom.helperText) {
    dom.helperText.textContent = `当前已选城市：${city.name}（${city.province}）。点击“开始绘制”后，将围绕该城市添加山、河流或湖泊。`;
  }

  map.getSource("city-highlight").setData({
    type: "FeatureCollection",
    features: [
      toPointFeature({ lng: city.lng, lat: city.lat }, {
        name: city.name,
        province: city.province
      })
    ]
  });

  map.easeTo({
    center: [city.lng, city.lat],
    zoom: Math.max(map.getZoom(), 4.8),
    duration: 1200,
    offset: [0, 0]
  });

  popup
    .setLngLat([city.lng, city.lat])
    .setHTML(`<div class="city-popup-title">${city.name}</div><div class="city-popup-meta">${city.province}</div>`)
    .addTo(map);
};

renderFeatureList = function renderFeatureList(type, target) {
  target.innerHTML = "";
  const features = state.userFeatures.filter((feature) => feature.type === type);

  if (features.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = `暂无${displayType(type)}对象`;
    target.append(li);
    return;
  }

  for (const feature of features) {
    const li = document.createElement("li");
    li.className = "feature-list-item";

    const button = document.createElement("button");
    button.type = "button";
    if (feature.id === state.selectedFeatureId) {
      button.classList.add("is-active");
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "feature-delete";
    deleteButton.textContent = "删除";

    const cityMeta = feature.cityName ? `${feature.cityName}${feature.province ? ` · ${feature.province}` : ""}` : "未绑定城市";
    button.innerHTML = `<strong>${feature.name}</strong><span class="feature-meta">${displayType(type)} · ${cityMeta} · ${feature.points.length} point(s)</span>`;
    button.addEventListener("click", () => {
      setSelectionHighlight(feature.id);
    });
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteFeature(feature.id);
    });

    li.append(button);
    li.append(deleteButton);
    target.append(li);
  }
};

setSelectionHighlight = function setSelectionHighlight(featureId) {
  state.selectedFeatureId = featureId;
  persistState();
  renderFeatureLists();

  const feature = state.userFeatures.find((item) => item.id === featureId);
  map.getSource("selection-highlight").setData(emptyFeatureCollection());
  if (!feature) {
    return;
  }

  if (feature.type === "mountain") {
    map.easeTo({ center: [feature.points[0].lng, feature.points[0].lat], zoom: Math.max(map.getZoom(), 5.4), duration: 900 });
  } else {
    fitFeature(feature.points);
  }
  animateFeatureMarker(feature.id);
};

function syncFeatureMarkers() {
  const nextIds = new Set();

  for (const feature of state.userFeatures) {
    nextIds.add(feature.id);
    const anchor = getFeatureAnchor(feature);
    if (!anchor) {
      continue;
    }

    let entry = featureMarkers.get(feature.id);
    if (!entry) {
      const element = buildFeatureMarkerElement(feature);
      const marker = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([anchor.lng, anchor.lat])
        .addTo(map);
      entry = { marker, element };
      featureMarkers.set(feature.id, entry);
    } else {
      entry.element.className = `feature-marker feature-marker-${feature.type}`;
      entry.element.innerHTML = markerInnerHtml(feature.type);
      entry.element.title = feature.name;
      entry.marker.setLngLat([anchor.lng, anchor.lat]);
    }
  }

  for (const [featureId, entry] of featureMarkers.entries()) {
    if (!nextIds.has(featureId)) {
      entry.marker.remove();
      featureMarkers.delete(featureId);
    }
  }
}

function buildFeatureMarkerElement(feature) {
  const element = document.createElement("div");
  element.className = `feature-marker feature-marker-${feature.type}`;
  element.innerHTML = markerInnerHtml(feature.type);
  element.title = feature.name;
  return element;
}

function markerInnerHtml(type) {
  const icon = {
    mountain: "⛰",
    river: "≈",
    lake: "◉"
  }[type];
  return `<span class="feature-marker-icon">${icon}</span>`;
}

function getFeatureAnchor(feature) {
  if (!feature?.points?.length) {
    return null;
  }

  if (feature.type === "mountain") {
    return feature.points[0];
  }

  if (feature.type === "river") {
    return feature.points[Math.floor(feature.points.length / 2)];
  }

  let lng = 0;
  let lat = 0;
  for (const point of feature.points) {
    lng += point.lng;
    lat += point.lat;
  }
  return {
    lng: Number((lng / feature.points.length).toFixed(6)),
    lat: Number((lat / feature.points.length).toFixed(6))
  };
}

function animateFeatureMarker(featureId) {
  const entry = featureMarkers.get(featureId);
  if (!entry) {
    return;
  }

  entry.element.classList.remove("is-bouncing");
  void entry.element.offsetWidth;
  entry.element.classList.add("is-bouncing");
  window.setTimeout(() => {
    entry.element.classList.remove("is-bouncing");
  }, 850);
}

function deleteFeature(featureId) {
  const nextFeatures = state.userFeatures.filter((feature) => feature.id !== featureId);
  if (nextFeatures.length === state.userFeatures.length) {
    return;
  }

  state.userFeatures = nextFeatures;
  if (state.selectedFeatureId === featureId) {
    state.selectedFeatureId = null;
    map.getSource("selection-highlight").setData(emptyFeatureCollection());
  }
  persistState();
  syncUserFeatureSources();
  renderFeatureLists();
}

buildFeatureMarkerElement = function buildFeatureMarkerElement(feature) {
  const element = document.createElement("div");
  element.className = `feature-marker feature-marker-${feature.type}`;
  element.innerHTML = markerInnerHtml(feature.type);
  element.title = feature.name;
  return element;
};

markerInnerHtml = function markerInnerHtml(type) {
  const icon = {
    mountain: "⛰",
    river: "≈",
    lake: "◉"
  }[type];
  return `<div class="feature-marker-inner"><span class="feature-marker-icon">${icon}</span></div>`;
};

animateFeatureMarker = function animateFeatureMarker(featureId) {
  const entry = featureMarkers.get(featureId);
  if (!entry) {
    return;
  }

  const animatedNode = entry.inner || entry.element.querySelector(".feature-marker-inner") || entry.element;
  animatedNode.classList.remove("is-bouncing");
  void animatedNode.offsetWidth;
  animatedNode.classList.add("is-bouncing");
  window.setTimeout(() => {
    animatedNode.classList.remove("is-bouncing");
  }, 850);
};

displayType = function displayType(type) {
  return {
    mountain: "山",
    river: "河流",
    lake: "湖泊"
  }[type];
};

bindUi = function bindUi() {
  dom.citySearch.addEventListener("input", () => {
    const query = normalizeSearchToken(dom.citySearch.value);
    if (!query) {
      renderCityResults([]);
      return;
    }

    const matches = cities
      .map((city) => ({ city, score: cityMatchScore(city, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name, "zh-Hans-CN"))
      .slice(0, 12)
      .map((item) => item.city);

    renderCityResults(matches);
  });

  dom.startDrawing.addEventListener("click", () => startDrawing());
  dom.finishDrawing.addEventListener("click", () => finishDrawing());
  dom.cancelDrawing.addEventListener("click", () => resetDrawing());
  dom.themeSelect.addEventListener("change", () => {
    state.theme = dom.themeSelect.value;
    persistState();
    applyTheme(state.theme);
  });
};

renderCityResults = function renderCityResults(items) {
  dom.cityResults.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = dom.citySearch.value.trim() ? "没有匹配结果。" : "输入城市名称后显示候选结果。";
    dom.cityResults.append(li);
    return;
  }

  for (const city of items) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ui-entry-button city-result-card";
    button.innerHTML = `<span class="ui-entry"><span class="ui-entry-head"><span class="ui-entry-title">${city.name}</span><span class="ui-entry-badge">城市</span></span><span class="ui-entry-meta"><strong>${city.province}</strong><span>点击后定位并作为新增对象的参考城市</span></span></span>`;
    button.addEventListener("click", () => focusCity(city));
    li.append(button);
    dom.cityResults.append(li);
  }
};

updateDrawIndicator = function updateDrawIndicator() {
  if (!state.drawing.active) {
    dom.drawIndicator.textContent = "未开始绘制";
    return;
  }

  const cityName = selectedCity?.name || "未选城市";
  if (state.drawing.type === "mountain") {
    dom.drawIndicator.textContent = `绘制中：山 · ${cityName} · 点击地图确定位置，再点“完成对象”保存`;
    return;
  }

  dom.drawIndicator.textContent = `绘制中：${displayType(state.drawing.type)} · ${cityName} · 地图点击采点，完成后手动保存`;
};

startDrawing = function startDrawing() {
  const name = dom.featureName.value.trim();
  if (!name) {
    window.alert("请先输入对象名称。");
    return;
  }

  if (!selectedCity) {
    window.alert("请先通过左侧搜索并选中一个城市，再开始添加对象。");
    return;
  }

  state.drawing.active = true;
  state.drawing.type = dom.featureType.value;
  currentPreview = [];
  map.easeTo({
    center: [selectedCity.lng, selectedCity.lat],
    zoom: Math.max(map.getZoom(), 5.2),
    duration: 700
  });
  syncPreviewSource();
  updateDrawIndicator();
};

finishDrawing = function finishDrawing() {
  if (!state.drawing.active) {
    return;
  }

  const type = state.drawing.type;
  const name = dom.featureName.value.trim();
  const description = dom.featureDescription.value.trim();

  if (!name) {
    window.alert("对象名称不能为空。");
    return;
  }

  const requiredPoints = type === "mountain" ? 1 : type === "river" ? 2 : 3;
  if (currentPreview.length < requiredPoints) {
    window.alert(`当前类型至少需要 ${requiredPoints} 个点。`);
    return;
  }

  const feature = {
    id: crypto.randomUUID(),
    type,
    name,
    description,
    cityName: selectedCity?.name || null,
    province: selectedCity?.province || null,
    points: [...currentPreview],
    createdAt: Date.now()
  };

  state.userFeatures.push(feature);
  state.selectedFeatureId = feature.id;
  persistState();
  syncUserFeatureSources();
  setSelectionHighlight(feature.id);
  resetDrawing();
};

resetDrawing = function resetDrawing() {
  state.drawing.active = false;
  state.drawing.type = dom.featureType.value;
  currentPreview = [];
  syncPreviewSource();
  dom.drawIndicator.textContent = "未开始绘制";
};

focusCity = function focusCity(city) {
  selectedCity = city;
  if (!state.drawing.active && dom.helperText) {
    dom.helperText.textContent = `当前已选城市：${city.name}（${city.province}）。点击“开始绘制”后，将围绕该城市添加山、河流或湖泊。`;
  }

  map.getSource("city-highlight").setData({
    type: "FeatureCollection",
    features: [toPointFeature({ lng: city.lng, lat: city.lat }, { name: city.name, province: city.province })]
  });

  map.easeTo({
    center: [city.lng, city.lat],
    zoom: Math.max(map.getZoom(), 4.8),
    duration: 1200,
    offset: [0, 0]
  });

  popup
    .setLngLat([city.lng, city.lat])
    .setHTML(`<div class="city-popup-title">${city.name}</div><div class="city-popup-meta">${city.province}</div>`)
    .addTo(map);
};

syncUserFeatureSources = function syncUserFeatureSources() {
  if (!map) {
    return;
  }

  ensureMountainBaseVisualization();

  const mountains = emptyFeatureCollection();
  const mountainBases = emptyFeatureCollection();
  const rivers = emptyFeatureCollection();
  const lakes = emptyFeatureCollection();

  for (const feature of state.userFeatures) {
    if (feature.type === "mountain") {
      mountains.features.push(toPointFeature(feature.points[0], {
        id: feature.id,
        name: feature.name,
        description: feature.description || "",
        cityName: feature.cityName || "",
        province: feature.province || ""
      }));
      mountainBases.features.push(buildMountainFootprint(feature));
    }

    if (feature.type === "river") {
      rivers.features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: feature.points.map(({ lng, lat }) => [lng, lat])
        },
        properties: {
          id: feature.id,
          name: feature.name,
          description: feature.description || "",
          cityName: feature.cityName || "",
          province: feature.province || ""
        }
      });
    }

    if (feature.type === "lake") {
      lakes.features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...feature.points, feature.points[0]].map(({ lng, lat }) => [lng, lat])]
        },
        properties: {
          id: feature.id,
          name: feature.name,
          description: feature.description || "",
          cityName: feature.cityName || "",
          province: feature.province || ""
        }
      });
    }
  }

  map.getSource("user-mountain").setData(mountains);
  map.getSource("user-mountain-base").setData(mountainBases);
  map.getSource("user-river").setData(rivers);
  map.getSource("user-lake").setData(lakes);
  syncFeatureMarkers();
};

renderFeatureList = function renderFeatureList(type, target) {
  target.innerHTML = "";
  const features = state.userFeatures.filter((feature) => feature.type === type);

  if (features.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = `暂无${displayType(type)}对象`;
    target.append(li);
    return;
  }

  for (const feature of features) {
    const li = document.createElement("li");
    li.className = "feature-list-item";
    const button = document.createElement("button");
    const deleteButton = document.createElement("button");
    button.type = "button";
    button.className = "ui-entry-button feature-entry-button";
    deleteButton.type = "button";
    deleteButton.className = "feature-delete";
    deleteButton.textContent = "删除";

    if (feature.id === state.selectedFeatureId) {
      button.classList.add("is-active");
    }

    const cityMeta = feature.cityName ? `${feature.cityName}${feature.province ? ` · ${feature.province}` : ""}` : "未绑定城市";
    const description = feature.description?.trim() || "未填写说明";
    button.innerHTML = `<span class="ui-entry"><span class="ui-entry-head"><span class="ui-entry-title">${feature.name}</span><span class="ui-entry-badge" data-type="${feature.type}">${displayType(type)}</span></span><span class="ui-entry-meta"><strong>${cityMeta}</strong><span>${feature.points.length} 个定位点</span></span><span class="ui-entry-description">${description}</span></span>`;
    button.addEventListener("click", () => setSelectionHighlight(feature.id));
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteFeature(feature.id);
    });

    li.append(button);
    li.append(deleteButton);
    target.append(li);
  }
};

setSelectionHighlight = function setSelectionHighlight(featureId) {
  state.selectedFeatureId = featureId;
  persistState();
  renderFeatureLists();

  const feature = state.userFeatures.find((item) => item.id === featureId);
  map.getSource("selection-highlight").setData(emptyFeatureCollection());
  if (!feature) {
    return;
  }

  if (feature.type === "mountain") {
    map.easeTo({
      center: [feature.points[0].lng, feature.points[0].lat],
      zoom: Math.max(map.getZoom(), 5.4),
      duration: 900
    });
  } else {
    fitFeature(feature.points);
  }

  animateFeatureMarker(feature.id);
};

syncFeatureMarkers = function syncFeatureMarkers() {
  const nextIds = new Set();

  for (const feature of state.userFeatures) {
    nextIds.add(feature.id);
    const anchor = getFeatureAnchor(feature);
    if (!anchor) {
      continue;
    }

    let entry = featureMarkers.get(feature.id);
    if (!entry) {
      const element = buildFeatureMarkerElement(feature);
      const inner = element.querySelector(".feature-marker-inner");
      const marker = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([anchor.lng, anchor.lat])
        .addTo(map);
      entry = { marker, element, inner };
      featureMarkers.set(feature.id, entry);
    } else {
      entry.element.className = `feature-marker feature-marker-${feature.type}`;
      entry.element.innerHTML = markerInnerHtml(feature.type);
      entry.element.title = feature.name;
      entry.inner = entry.element.querySelector(".feature-marker-inner");
      entry.marker.setLngLat([anchor.lng, anchor.lat]);
    }
  }

  for (const [featureId, entry] of featureMarkers.entries()) {
    if (!nextIds.has(featureId)) {
      entry.marker.remove();
      featureMarkers.delete(featureId);
    }
  }
};

function normalizeSearchToken(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function cityMatchScore(city, query) {
  const name = normalizeSearchToken(city.name);
  const normalizedName = normalizeSearchToken(city.normalizedName);
  const province = normalizeSearchToken(city.province);
  const combined = `${province}${name}`;
  const reversed = `${name}${province}`;

  if (combined === query || reversed === query) {
    return 120;
  }
  if (name === query || normalizedName === query) {
    return 110;
  }
  if (province === query) {
    return 90;
  }
  if (combined.includes(query) || reversed.includes(query)) {
    return 80;
  }
  if (name.includes(query) || normalizedName.includes(query)) {
    return 70;
  }
  if (province.includes(query)) {
    return 60;
  }
  return 0;
}

function ensureMountainBaseVisualization() {
  if (!map.getSource("user-mountain-base")) {
    map.addSource("user-mountain-base", {
      type: "geojson",
      data: emptyFeatureCollection()
    });
  }

  if (!map.getLayer("user-mountain-base-fill")) {
    map.addLayer({
      id: "user-mountain-base-fill",
      type: "fill",
      source: "user-mountain-base",
      paint: {
        "fill-color": "#8d6a4e",
        "fill-opacity": 0.32
      }
    }, "user-mountain-shadow");
  }

  if (!map.getLayer("user-mountain-base-line")) {
    map.addLayer({
      id: "user-mountain-base-line",
      type: "line",
      source: "user-mountain-base",
      paint: {
        "line-color": "#6f4e36",
        "line-width": 1.5,
        "line-opacity": 0.56
      }
    }, "user-mountain-shadow");
  }
}

function buildMountainFootprint(feature) {
  const center = feature.points[0];
  const dx = 0.42;
  const dy = 0.28;
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [center.lng - dx, center.lat - dy * 0.2],
        [center.lng - dx * 0.52, center.lat + dy],
        [center.lng, center.lat + dy * 0.55],
        [center.lng + dx * 0.58, center.lat + dy],
        [center.lng + dx, center.lat - dy * 0.18],
        [center.lng + dx * 0.36, center.lat - dy * 0.95],
        [center.lng - dx * 0.28, center.lat - dy * 0.92],
        [center.lng - dx, center.lat - dy * 0.2]
      ]]
    },
    properties: {
      id: feature.id,
      name: feature.name
    }
  };
}

init().catch((error) => {
  console.error(error);
  window.alert("GIS 数据初始化失败，请先执行 npm install、npm run prepare:vendor、npm run prepare:data。");
});
