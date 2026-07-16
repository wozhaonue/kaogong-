import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const rootDir = process.cwd();
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".geojson": "application/geo+json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const resolvedPath = normalize(join(rootDir, pathname));

  if (!resolvedPath.startsWith(rootDir) || !existsSync(resolvedPath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const stats = statSync(resolvedPath);
  if (stats.isDirectory()) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Directory listing is disabled");
    return;
  }

  const ext = extname(resolvedPath);
  const shouldDisableCache = [".html", ".js", ".json", ".geojson", ".css"].includes(ext);
  res.writeHead(200, {
    "Cache-Control": shouldDisableCache ? "no-cache" : "public, max-age=3600",
    "Content-Type": contentTypes[ext] || "application/octet-stream"
  });
  createReadStream(resolvedPath).pipe(res);
}).listen(port, () => {
  console.log(`Static server running at http://127.0.0.1:${port}`);
});
