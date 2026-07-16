import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const files = [
  {
    source: resolve("node_modules/maplibre-gl/dist/maplibre-gl.js"),
    target: resolve("vendor/maplibre-gl.js")
  },
  {
    source: resolve("node_modules/maplibre-gl/dist/maplibre-gl.css"),
    target: resolve("vendor/maplibre-gl.css")
  }
];

for (const file of files) {
  if (!existsSync(file.source)) {
    throw new Error(`Missing dependency asset: ${file.source}`);
  }
  mkdirSync(dirname(file.target), { recursive: true });
  copyFileSync(file.source, file.target);
}

console.log("Copied MapLibre assets into vendor/.");
