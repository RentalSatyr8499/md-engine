let ws = null;
let lastActivity = Date.now();


function setupPresence(room) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "switch-room", room }));
    return;
  }

  if (ws && ws.readyState === WebSocket.CONNECTING) {
    // Wait for connection, then switch rooms
    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "switch-room", room }));
    });
    return;
  }

  ws = new WebSocket(
    location.hostname === "localhost"
      ? "ws://localhost:8080"
      : "wss://probable-tribble.fly.dev"
  );

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "switch-room", room }));
  };

  ws.onmessage = event => {
    const { online, idle } = JSON.parse(event.data);
    updatePresenceUI(online, idle);
  };

  ws.onclose = () => console.warn("WS closed");
  ws.onerror = err => console.error("WS error", err);
}


function updatePresenceUI(online, idle) {
    document.getElementById("numOnline").textContent = `${online}`;
    document.getElementById("numIdle").textContent = `${idle}`;
}

ws.onopen = () => {
    console.log("WS connected");
};

ws.onerror = err => {
    console.error("WS error", err);
};

ws.onclose = () => {
    console.warn("WS closed");
};


