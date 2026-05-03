import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(__dirname, ".."); // project root

function serveStatic(req, res) {
  let reqPath = req.url;
  if (reqPath === "/") reqPath = "/index.html";

  const filePath = path.join(root, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".md": "text/plain"
    };

    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(serveStatic);

server.listen(port, host, () => {
  console.log(`Server listening on ${port}`);
});
