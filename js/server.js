import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function serveStatic(req, res) {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  let reqPath = decodeURIComponent(parsed.pathname);

  if (reqPath === "/") reqPath = "/index.html";

  const filePath = path.join(root, reqPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    const files = fs.readdirSync(filePath);
    const base = reqPath.endsWith("/") ? reqPath : reqPath + "/";

    const html = files
      .filter(f => !f.startsWith("."))
      .map(f => {
        const isDir = fs.lstatSync(path.join(filePath, f)).isDirectory();
        const href = base + f + (isDir ? "/" : "");
        return `<a href="${href}">${f}${isDir ? "/" : ""}</a>`;
      })
      .join("<br>\n");

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html",
      ".js":   "text/javascript",
      ".css":  "text/css",
      ".png":  "image/png",
      ".jpg":  "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg":  "image/svg+xml",
      ".md":   "text/plain",
      ".txt":  "text/plain",
    };

    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(serveStatic);

server.listen(port, host, () => {
  console.log(`Server listening on ${port}`);
});