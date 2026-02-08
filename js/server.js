import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: process.env.PORT || 3000,
    host: "0.0.0.0"
});

const clients = new Map(); // client → { lastActive }

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

// Broadcast every 10 seconds
setInterval(broadcastPresence, 10_000);

console.log("WebSocket presence server running");

wss.on("connection", ws => {
    console.log("Client connected");

    ws.on("message", msg => {
        console.log("Received:", msg.toString());
        if (msg.toString() === "active") {
            clients.get(ws).lastActive = Date.now();
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        clients.delete(ws);
        broadcastPresence();
    });

    broadcastPresence();
});
