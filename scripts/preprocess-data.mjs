import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const CHINA_BBOX = {
  west: 73,
  south: 18,
  east: 135,
  north: 54
};

const OUT_DIR = resolve("data");
const RAW_DIR = resolve("work/raw");

const DATASETS = {
  provinces: "https://raw.githubusercontent.com/longwosion/geojson-map-china/master/china.json",
  rivers: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson",
  lakes: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson",
  terrain: "https://raw.githubusercontent.com/nvkelso/natural-earth-raster/master/10m_rasters/HYP_LR_SR_W/HYP_LR_SR_W.tif"
};

const PROVINCE_CITY_FILES = [
  "anhui",
  "beijing",
  "chongqing",
  "fujian",
  "gansu",
  "guangdong",
  "guangxi",
  "guizhou",
  "hainan",
  "hebei",
  "heilongjiang",
  "henan",
  "hubei",
  "hunan",
  "jiangsu",
  "jiangxi",
  "jilin",
  "liaoning",
  "neimenggu",
  "ningxia",
  "qinghai",
  "shandong",
  "shanghai",
  "shanxi-1",
  "shanxi-2",
  "sichuan",
  "taiwan",
  "tianjin",
  "xinjiang",
  "xizang",
  "yunnan",
  "zhejiang"
];

const PROVINCE_NAME_MAP = {
  anhui: "安徽",
  beijing: "北京",
  chongqing: "重庆",
  fujian: "福建",
  gansu: "甘肃",
  guangdong: "广东",
  guangxi: "广西",
  guizhou: "贵州",
  hainan: "海南",
  hebei: "河北",
  heilongjiang: "黑龙江",
  henan: "河南",
  hubei: "湖北",
  hunan: "湖南",
  jiangsu: "江苏",
  jiangxi: "江西",
  jilin: "吉林",
  liaoning: "辽宁",
  neimenggu: "内蒙古",
  ningxia: "宁夏",
  qinghai: "青海",
  shandong: "山东",
  shanghai: "上海",
  "shanxi-1": "陕西",
  "shanxi-2": "山西",
  sichuan: "四川",
  taiwan: "台湾",
  tianjin: "天津",
  xinjiang: "新疆",
  xizang: "西藏",
  yunnan: "云南",
  zhejiang: "浙江"
};

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }
  return response.json();
}

async function fetchArrayBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function ensureDirs() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(RAW_DIR, { recursive: true });
}

function featureBBox(feature) {
  const coords = [];
  collectCoordinates(feature.geometry?.coordinates, coords);
  if (coords.length === 0) {
    return null;
  }

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  return [minLng, minLat, maxLng, maxLat];
}

function collectCoordinates(input, output) {
  if (!Array.isArray(input)) {
    return;
  }

  if (typeof input[0] === "number" && typeof input[1] === "number") {
    output.push([input[0], input[1]]);
    return;
  }

  for (const item of input) {
    collectCoordinates(item, output);
  }
}

function bboxIntersects(bbox, extent) {
  if (!bbox) {
    return false;
  }

  return !(
    bbox[2] < extent.west ||
    bbox[0] > extent.east ||
    bbox[3] < extent.south ||
    bbox[1] > extent.north
  );
}

function computeCentroid(feature) {
  const coords = [];
  collectCoordinates(feature.geometry?.coordinates, coords);
  if (coords.length === 0) {
    return null;
  }

  let lngTotal = 0;
  let latTotal = 0;
  for (const [lng, lat] of coords) {
    lngTotal += lng;
    latTotal += lat;
  }

  return {
    lng: Number((lngTotal / coords.length).toFixed(6)),
    lat: Number((latTotal / coords.length).toFixed(6))
  };
}

function normalizeCityName(name) {
  return String(name || "")
    .replace(/\s+/g, "")
    .replace(/(市|地区|盟|自治州|特别行政区)$/u, "");
}

function simplifyProvinceFeature(feature) {
  const properties = feature.properties || {};
  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      id: properties.id || properties.adcode || properties.code || properties.name,
      name: properties.name,
      shortName: properties.name?.slice(0, 2) || properties.name
    }
  };
}

async function buildProvinceData() {
  const provinces = await fetchJson(DATASETS.provinces);
  const output = {
    type: "FeatureCollection",
    features: provinces.features.map(simplifyProvinceFeature)
  };

  writeFileSync(resolve(OUT_DIR, "provinces.geojson"), JSON.stringify(output));
}

async function buildCityIndex() {
  const cityFeatures = [];

  for (const provinceKey of PROVINCE_CITY_FILES) {
    const url = `https://raw.githubusercontent.com/d3cn/data/master/json/geo/china/province-city/${provinceKey}.geojson`;
    const geojson = await fetchJson(url);
    for (const feature of geojson.features) {
      const centroid = computeCentroid(feature);
      if (!centroid) {
        continue;
      }

      const props = feature.properties || {};
      const rawProvinceName =
        props.parent?.name ||
        props.province ||
        props.owner ||
        PROVINCE_NAME_MAP[provinceKey] ||
        provinceKey;
      const provinceName = PROVINCE_NAME_MAP[rawProvinceName] || rawProvinceName;
      const name = props.name || props.city || props.NAME || "未命名城市";

      cityFeatures.push({
        id: props.id || `${provinceKey}-${name}`,
        name,
        normalizedName: normalizeCityName(name),
        province: provinceName,
        lng: centroid.lng,
        lat: centroid.lat
      });
    }
  }

  cityFeatures.sort((a, b) => a.normalizedName.localeCompare(b.normalizedName, "zh-Hans-CN"));
  writeFileSync(resolve(OUT_DIR, "cities.json"), JSON.stringify(cityFeatures));
}

async function buildHydroData() {
  const [rivers, lakes] = await Promise.all([
    fetchJson(DATASETS.rivers),
    fetchJson(DATASETS.lakes)
  ]);

  const filteredRivers = {
    type: "FeatureCollection",
    features: rivers.features
      .filter((feature) => bboxIntersects(featureBBox(feature), CHINA_BBOX))
      .map((feature, index) => ({
        type: "Feature",
        geometry: feature.geometry,
        properties: {
          id: feature.properties?.name || `river-${index}`,
          name: feature.properties?.name || "Unnamed river",
          scalerank: feature.properties?.scalerank ?? 10
        }
      }))
  };

  const filteredLakes = {
    type: "FeatureCollection",
    features: lakes.features
      .filter((feature) => bboxIntersects(featureBBox(feature), CHINA_BBOX))
      .map((feature, index) => ({
        type: "Feature",
        geometry: feature.geometry,
        properties: {
          id: feature.properties?.name || `lake-${index}`,
          name: feature.properties?.name || "Unnamed lake",
          scalerank: feature.properties?.scalerank ?? 10
        }
      }))
  };

  writeFileSync(resolve(OUT_DIR, "rivers.geojson"), JSON.stringify(filteredRivers));
  writeFileSync(resolve(OUT_DIR, "lakes.geojson"), JSON.stringify(filteredLakes));
}

function worldCrop(width, height, bounds) {
  const left = Math.floor(((bounds.west + 180) / 360) * width);
  const top = Math.floor(((90 - bounds.north) / 180) * height);
  const right = Math.ceil(((bounds.east + 180) / 360) * width);
  const bottom = Math.ceil(((90 - bounds.south) / 180) * height);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top
  };
}

async function buildTerrainOverlay() {
  const terrainBuffer = await fetchArrayBuffer(DATASETS.terrain);
  const image = sharp(terrainBuffer, { unlimited: true });
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Terrain image metadata is unavailable");
  }

  const crop = worldCrop(metadata.width, metadata.height, {
    west: CHINA_BBOX.west - 8,
    south: CHINA_BBOX.south - 4,
    east: CHINA_BBOX.east + 8,
    north: CHINA_BBOX.north + 6
  });

  await image
    .extract(crop)
    .resize({ width: 2048 })
    .webp({ quality: 86 })
    .toFile(resolve(OUT_DIR, "terrain-relief.webp"));

  writeFileSync(
    resolve(OUT_DIR, "terrain-bounds.json"),
    JSON.stringify([
      [CHINA_BBOX.west - 8, CHINA_BBOX.north + 6],
      [CHINA_BBOX.east + 8, CHINA_BBOX.north + 6],
      [CHINA_BBOX.east + 8, CHINA_BBOX.south - 4],
      [CHINA_BBOX.west - 8, CHINA_BBOX.south - 4]
    ])
  );
}

async function main() {
  ensureDirs();
  await buildProvinceData();
  await buildCityIndex();
  await buildHydroData();
  await buildTerrainOverlay();
  console.log("Prepared GIS assets in data/.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
