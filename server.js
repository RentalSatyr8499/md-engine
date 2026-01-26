import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

const clients = new Map(); // client → { lastActive }

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

// Broadcast every 10 seconds
setInterval(broadcastPresence, 10_000);

console.log("WebSocket presence server running");
