const ROOT = "assets/notesets/";

const config = {
    siteTitle: "xaqnotes",
    "secondsUntilIdle": 60
};

async function fetchDirectoryListing(path) {
    const res = await fetch(path);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const base = "/" + path.replace(/\/$/, ""); 

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

async function loadClasses() {
    const classDirs = await fetchDirectoryListing("notes/");
    const container = document.getElementById("content");
    container.innerHTML = `
        <div id="main-container">
            <h1>${config.siteTitle}</h1>
        </div>
    `;

    classDirs.forEach(dir => {
        const name = dir.replace("/", "");

        const item = document.createElement("div");
        item.className = "noteset-item";
        item.textContent = name;

        item.onclick = () => {
            history.pushState({}, "", `/?class=${encodeURIComponent(name)}`);
            routeFromURL();
        };


        document.getElementById("main-container").appendChild(item);
    });

    document.getElementById("reveal-toggle").style.display = "none";
    document.getElementById("reveal-toggle").style.display = "none";
}

async function loadNotesets(className) { 
    const files = await fetchDirectoryListing(`notes/${className}/`); 
    const notesetDirs = files .filter(f => f.endsWith(".md")) .map(f => f.replace(".md", ""));

    const container = document.getElementById("content");
    container.innerHTML = `
        <div id="main-container">
            <h1>${className}</h1>
        </div>
    `;

    notesetDirs.forEach(dir => {
        const name = dir.replace("/", "");

        const item = document.createElement("div");
        item.className = "noteset-item";
        item.textContent = name;

        item.onclick = () => {
            history.pushState(
                {},
                "",
                `/?class=${encodeURIComponent(className)}&noteset=${encodeURIComponent(name)}`
            );
            routeFromURL();
        };




        document.getElementById("main-container").appendChild(item);
    });

    document.getElementById("presence-indicator").style.display = "flex";
    document.getElementById("reveal-toggle").style.display = "none";
    setupPresence(className);
}

function buildNotesetUI(name, className) {
    const container = document.getElementById("content");

    container.innerHTML = `
        <div class="noteset-header">
            <img src="./assets/back.png" class="back-button" alt="Back" title="view all notesets">
            <h1>${name}</h1>
        </div>
        <p id="loading-message">Loading notes…</p>
    `;

    document.querySelector(".back-button").onclick = () => {
        history.pushState({}, "", `/?class=${encodeURIComponent(className)}`);
        loadNotesets(className);
    };



    return container;
}

const notesCache = new Map();
async function loadMarkdownFiles(notesetName, className) {
  const md = await fetch(`/notes/${className}/${notesetName}.md`).then(r => r.text());
  return [{ file: `${notesetName}.md`, md }];
}


function transformMarkdown(html) {
    html = html.replace(/\{\{(.*?)\}\}/g, (_, p1) =>
        `<span class="blank" onclick="this.classList.toggle('show')" title="reveal answer">${p1}</span>`
    );
    html = html.replace(/(\S)\^(\S+)/g, (_, base, sup) =>
        `${base}<sup>${sup}</sup>`
    );
    html = html.replace(/(\S)_(\S+)/g, (_, base, sub) =>
        `${base}<sub>${sub}</sub>`
    );
    html = html.replace(/\$(.+?)\$/g, (_, expr) =>
        `<span class="math">${expr}</span>`
    );

    return html;
}

function applyCollapsibleBehavior(header, content) {
    header.onclick = () => {
        const isOpen = content.classList.toggle("open");

        if (isOpen) {
            content.style.height = content.scrollHeight + "px";
            setTimeout(() => (content.style.height = "auto"), 300);
        } else {
            content.style.height = content.scrollHeight + "px";
            requestAnimationFrame(() => {
                content.style.height = "0px";
            });
        }
    };
}

async function loadNoteset(name, className) {
    const container = buildNotesetUI(name, className);

    const files = await loadMarkdownFiles(name, className);
    document.querySelector("#loading-message").remove();

    for (const { file, md } of files) {
        const noteTitle = file.slice(3).replace(".md", "");

        const header = document.createElement("h2");
        header.textContent = noteTitle;
        header.className = "collapsible-header";
        header.title = "click to toggle collapse"

        const content = document.createElement("div");
        content.className = "note-content collapsible-content";

        applyCollapsibleBehavior(header, content);

        container.appendChild(header);
        container.appendChild(content);

        let html = marked.parse(md);
        html = transformMarkdown(html);

        content.innerHTML = html;

        content.querySelectorAll("pre code").forEach(block => {
            hljs.highlightElement(block);
        });
    }

    document.getElementById("reveal-toggle").style.display = "flex";
    setupRevealToggle();
}

function setupRevealToggle() {
    const icon = document.getElementById("revealIcon");
    let revealed = false;

    document.getElementById("reveal-toggle").onclick = () => {
        revealed = !revealed;

        // Toggle all blanks
        document.querySelectorAll(".blank").forEach(el => {
            if (revealed) {
                el.classList.add("show");
            } else {
                el.classList.remove("show");
            }
        });

        // Update icon
        icon.src = revealed
            ? "./assets/eye-closed.png"
            : "./assets/eye-open.png";
    };
}

function routeFromURL() {
  const params = new URLSearchParams(window.location.search);
  const className = params.get("class");
  const noteset = params.get("noteset");

  if (!className) {
    // homepage: list all classes
    setupPresence("home");
    loadClasses();
    return;
  }

  if (!noteset) {
    // class page: list notesets
    setupPresence(className);
    loadNotesets(className);
    return;
  }

  // noteset page
  setupPresence(className);
  loadNoteset(className, noteset);
}






