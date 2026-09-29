// Minimal zero-dependency static file server used by Playwright's webServer
// config (see playwright.config.js). Avoids depending on `python3`, which
// isn't installed/aliased on every machine (Windows in particular).
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.argv[2] || process.env.PORT || 8934);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  let filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const NO_CACHE_EXT = new Set([".html", ".css", ".js"]);
  const send = (data, servedPath) => {
    const ext = path.extname(servedPath).toLowerCase();
    const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
    // HTML/CSS/JS change on every deploy. We send no ETag/Last-Modified,
    // so a plain "no-cache" has nothing to revalidate against and some
    // browsers (mobile Safari in particular) end up just reusing the old
    // cached copy anyway. "no-store" forbids caching it at all, which is
    // unambiguous — fine for a low-traffic site with no build step to
    // hash filenames for cache-busting instead.
    if (NO_CACHE_EXT.has(ext)) headers["Cache-Control"] = "no-store";
    res.writeHead(200, headers);
    res.end(data);
  };
  const send404 = () => {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  };

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    fs.readFile(filePath, (readErr, data) => {
      if (!readErr) return send(data, filePath);

      // Clean-URL fallback: /admin -> admin.html (matches the extensionless
      // links this site is linked/bookmarked with locally via `npx serve`,
      // which the production static server doesn't do by default).
      if (!path.extname(filePath)) {
        const withHtml = `${filePath}.html`;
        fs.readFile(withHtml, (err2, data2) => {
          if (err2) return send404();
          send(data2, withHtml);
        });
        return;
      }
      send404();
    });
  });
});

server.listen(PORT, () => {
  console.log(`Static server ready on http://localhost:${PORT}`);
});
