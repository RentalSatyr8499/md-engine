import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import { WebSocketServer } from "ws";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function serveStatic(req, res) {
    let pathname = url.parse(req.url).pathname;

    if (pathname === "/") pathname = "/index.html";

    const filePath = path.join(__dirname, pathname);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not found");
            return;
        }

        // very small content-type map (enough for your app)
        const ext = path.extname(filePath);
        const typeMap = {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".md": "text/markdown"
        };

        res.writeHead(200, {
            "Content-Type": typeMap[ext] || "application/octet-stream"
        });
        res.end(data);
    });
}

const server = http.createServer(serveStatic);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("Server running on", PORT));

/* ================= WebSocket presence ================= */

const clients = new Map(); // ws → { lastActive }

function broadcastPresence() {
    const now = Date.now();
    let online = 0;
    let idle = 0;

    for (const { lastActive } of clients.values()) {
        const diff = now - lastActive;
        if (diff < 30_000) online++;
        else idle++;
    }

    const msg = JSON.stringify({ online, idle });

    for (const ws of clients.keys()) {
        if (ws.readyState === ws.OPEN) ws.send(msg);
    }
}

wss.on("connection", ws => {
    clients.set(ws, { lastActive: Date.now() });

    ws.on("message", msg => {
        if (msg.toString() === "active") {
            clients.get(ws).lastActive = Date.now();
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
        broadcastPresence();
    });

    broadcastPresence();
});

setInterval(broadcastPresence, 10_000);

console.log("WebSocket presence server running");
