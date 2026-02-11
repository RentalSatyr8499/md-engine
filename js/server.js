import http from "http";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";
import url from "url";

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(__dirname, ".."); // project root

// ------------------------------
// STATIC FILE SERVER
// ------------------------------
function serveStatic(req, res) {
  let reqPath = req.url;
  if (reqPath === "/") reqPath = "/index.html";

  const filePath = path.join(root, reqPath);

  // 🔥 DEBUG LINES
  console.log("SERVER DEBUG: req.url =", req.url);
  console.log("SERVER DEBUG: reqPath =", reqPath);
  console.log("SERVER DEBUG: filePath =", filePath);
  console.log("SERVER DEBUG: root =", root);
  console.log("SERVER DEBUG: __dirname =", __dirname);

  // If it's a directory, return a listing
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    const files = fs.readdirSync(filePath);

    // 🔥 MORE DEBUG
    console.log("SERVER DEBUG: directory listing for", filePath, "=", files);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(files));
    return;
  }


  // Otherwise serve the file
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


const server = http.createServer((req, res) => {
  // Let WebSocket upgrades bypass static handling
  if (req.url.startsWith("/ws")) return;

  serveStatic(req, res);
});

// ------------------------------
// WEBSOCKET PRESENCE SERVER
// ------------------------------
const wss = new WebSocketServer({ server, path: "/ws" });

const clients = new Map();

function broadcastPresence(room) {
  const now = Date.now();
  let online = 0, idle = 0;

  for (const [ws, info] of clients.entries()) {
    if (info.room !== room) continue;
    const diff = now - info.lastActive;
    if (diff < 30000) online++;
    else idle++;
  }

  const msg = JSON.stringify({ online, idle, room });

  for (const [ws, info] of clients.entries()) {
    if (info.room === room && ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  }
}

wss.on("connection", ws => {
  clients.set(ws, { lastActive: Date.now(), room: null });

  ws.on("message", raw => {
    const msg = JSON.parse(raw);

    if (msg.type === "switch-room") {
      clients.get(ws).room = msg.room;
      clients.get(ws).lastActive = Date.now();
      broadcastPresence(msg.room);
    }

    if (msg.type === "active") {
      clients.get(ws).lastActive = Date.now();
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcastPresence();
  });

  broadcastPresence();
});

setInterval(broadcastPresence, 10000);

server.listen(port, host, () => {
  console.log(`Server listening on ${port}`);
});
