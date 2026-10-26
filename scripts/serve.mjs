import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    let file = path.resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(fs.readFileSync("pages/404.html"));
      return;
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(4173, "127.0.0.1", () => console.log("Aurevia preview: http://127.0.0.1:4173"));
