import http from "http";
import { WebSocketServer } from "ws";

const port = process.env.PORT || 3000;
const host = "0.0.0.0";
console.log(`port: ${port}`);
const server = http.createServer();

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
  console.log("Server listening on", port);
});
