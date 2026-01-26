const ROOT = "assets/notesets/";

const config = {
    siteTitle: "CS 4630",
    "secondsUntilIdle": 60
};

async function fetchDirectoryListing(path) {
    const res = await fetch(path);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const base = "/" + path.replace(/\/$/, ""); // "/assets/notesets"

    const links = [...doc.querySelectorAll("a")]
        .map(a => a.getAttribute("href"))
        .filter(href => href && href !== "../")
        .filter(href => href.startsWith(base + "/")) // must be inside this directory
        .filter(href => {
            // Count segments to ensure it's exactly one level deeper
            const rel = href.slice(base.length + 1); // remove "/assets/notesets/"
            return rel.split("/").filter(Boolean).length === 1;
        })
        .map(href => href.slice(base.length + 1)); // return just "Part 1/"

    return links;
}

async function loadNotesets() {
    const res = await fetch("/assets/notesets/manifest.json");
    const notesetDirs = await res.json();

    const container = document.getElementById("content");
    container.innerHTML = `
        <div id="main-container">
            <h1>${config.siteTitle}</h1>
        </div>
    `;

    Object.keys(notesetDirs).forEach(name => {
        const item = document.createElement("div");
        item.className = "noteset-item";
        item.textContent = name;

        item.onclick = () => loadNoteset(name);

        document.getElementById("main-container").appendChild(item);
    });
}

async function loadNoteset(name) {
    const container = document.getElementById("content");

    container.innerHTML = ` 
        <div class="noteset-header"> 
            <img src="./assets/back.png" class="back-button" alt="Back">
            <h1>${name}</h1> 
        </div> 
        <p id="loading-message">Loading notes…</p> 
    `; 
    
    document.querySelector(".back-button").onclick = () => loadNotesets();

    // Load manifest
    const res = await fetch("/assets/notesets/manifest.json");
    const manifest = await res.json();

    const mdFiles = manifest[name];

    if (!mdFiles) {
        document.getElementById("loading-message").textContent =
            "No notes found for this noteset.";
        return;
    }

    document.querySelector("#loading-message").remove();

    for (const file of mdFiles) {
        const notePath = `/assets/notesets/${name}/${file}`;
        await loadMarkdownNote(notePath);
    }
}

async function loadMarkdownNote(file) {
    const container = document.getElementById("content");
    const noteTitle = file
        .split("/")
        .pop()
        .replace(".md", "");
    const header = document.createElement("h2");
    header.textContent = noteTitle;
    header.className = "collapsible";

    const content = document.createElement("div");
    content.className = "note-content";
    content.style.display = "block";

    header.onclick = () => {
        content.style.display = content.style.display === "none" ? "block" : "none";
    };

    container.appendChild(header);
    container.appendChild(content);

    // Load markdown
    const md = await fetch(file).then(r => r.text());
    let html = marked.parse(md);

    // Replace {{answer}} with blanks
    html = html.replace(/\{\{(.*?)\}\}/g, (_, p1) =>
        `<span class="blank" onclick="this.classList.toggle('show')">${p1}</span>`
    );

    content.innerHTML = html;

    // Highlight code blocks
    content.querySelectorAll("pre code").forEach(block => {
        hljs.highlightElement(block);
    });
}

let ws;
let lastActivity = Date.now();

function setupPresence() {
    ws = new WebSocket("wss://yc-cs4630-sp26.fly.dev");

    ws.onmessage = event => {
        const { online, idle } = JSON.parse(event.data);
        updatePresenceUI(online, idle);
    };

    ["mousemove", "keydown", "click"]. forEach(evt => {
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


setupPresence();
loadNotesets();

