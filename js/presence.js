let ws;
let lastActivity = Date.now();

function setupPresence() {
    const ws = new WebSocket(
    location.hostname === "localhost"
        ? "ws://localhost:8080"
        : "wss://your-app-name.fly.dev"
    );


    ws.onmessage = event => {
        const { online, idle } = JSON.parse(event.data);
        updatePresenceUI(online, idle);
    };

    
    ["mousemove", "keydown", "click"].forEach(evt => {
        document.addEventListener(evt, () => {
            lastActivity = Date.now();
            ws.send("active");
        });
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            lastActivity = Date.now() - config.secondsUntilIdle*1000;
        } else {
            lastActivity = Date.now();
            ws.send("active");
        }
    });

    setInterval(() => {
        const now = Date.now();
        const diff = now - lastActivity;

        if (diff < config.secondsUntilIdle*1000) {
            ws.send("active");
        }
    }, 5000);

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


