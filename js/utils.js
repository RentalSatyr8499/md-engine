async function fetchDirectoryListing(path) {
    console.log("CLIENT DEBUG: requesting directory listing for:", path);

    const res = await fetch(path);
    const html = await res.text();

    console.log("CLIENT DEBUG: raw HTML returned for", path, ":\n", html);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const base = "/" + path.replace(/\/$/, "");
    console.log("CLIENT DEBUG: computed base =", base);

    const allHrefs = [...doc.querySelectorAll("a")].map(a => a.getAttribute("href"));
    console.log("CLIENT DEBUG: all hrefs found:", allHrefs);

    const links = allHrefs
        .filter(href => href && href !== "../")
        .filter(href => href.startsWith(base + "/"))
        .filter(href => {
            const rel = href.slice(base.length + 1);
            return rel.split("/").filter(Boolean).length === 1;
        })
        .map(href => href.slice(base.length + 1));

    console.log("CLIENT DEBUG: final filtered links:", links);

    return links;
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
async function loadMarkdownFiles(name, className) {
    if (notesCache.has(name)) {
        return notesCache.get(name);
    }

    const notes = await fetchDirectoryListing(`notes/${className}/notesets/${name}/`);
    const mdFiles = notes
        .filter(n => n.endsWith(".md"))
        .sort((a, b) => b.localeCompare(a));

    const results = [];

    for (const file of mdFiles) {
        const md = await fetch(`notes/${className}/notesets/${name}/${file}`).then(r => r.text());

        results.push({ file, md });
    }

    notesCache.set(name, results);
    return results;
}

function transformMarkdown(html, className, notesetName) {
    html = html.replace(/\{\{(.*?)\}\}/g, (_, p1) =>
        `<span class="blank" onclick="this.classList.toggle('show')">${p1}</span>`
    );

    html = html.replace(/(\S)\^(\S+)/g, (m, base, sup) => `${base}<sup>${sup}</sup>`);

    html = html.replace(/(\S)_(\S+)/g, (m, base, sub) => `${base}<sub>${sub}</sub>`);

    html = html.replace(
        /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
        (match, code) => {
            const escaped = code
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            return match.replace(code, escaped);
        }
    );

    html = html.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (match, src) => {
        if (/^https?:\/\//i.test(src)) return match;
        const filename = src.split("/").pop().replace(/^\.\//, "");
        const resolved = `notes/${className}/assets/${filename}`;
        return match.replace(src, resolved);
    });

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

    console.log("routing from URL...")
    const params = new URLSearchParams(window.location.search);
    const className = params.get("class");
    const noteset = params.get("noteset");

    if (!className) {
        console.log("loading homepage...");
        loadClasses();
        console.log("homepage loaded!...");
        return;
    }

    if (!noteset) {
        console.log("loading class page...");
        setupPresence(className);
        loadNotesets(className);
        console.log("class page loaded!...");
        return;
    }

    console.log("loading noteset...");
    setupPresence(className);
    loadNoteset(noteset, className);
    console.log("noteset loaded!...");

}






