async function fetchDirectoryListing(path) {
    const res = await fetch(path);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const base = "/" + path.replace(/\/$/, "");

    const allHrefs = [...doc.querySelectorAll("a")].map(a => a.getAttribute("href"));

    const links = allHrefs
        .filter(href => href && href !== "../")
        .filter(href => href.startsWith(base + "/"))
        .filter(href => {
            const rel = href.slice(base.length + 1);
            return rel.split("/").filter(Boolean).length === 1;
        })
        .map(href => href.slice(base.length + 1))
        .filter(name => !name.startsWith("."));   // ← ignore dotfiles

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
    // 1. Replace {{answer}} with blanks
    html = html.replace(/\{\{(.*?)\}\}/g, (_, p1) =>
        `<span class="blank" onclick="this.classList.toggle('show')">${p1}</span>`
    );

    // 2. Handle math blocks: $...$
    html = html.replace(/\$(.+?)\$/g, (_, expr) => {
        // superscript: x^{y}
        expr = expr.replace(/(\S)\^\{([^}]+)\}/g, (m, base, sup) => `${base}<sup>${sup}</sup>`);

        // subscript: x_{y}
        expr = expr.replace(/(\S)_\{([^}]+)\}/g, (m, base, sub) => `${base}<sub>${sub}</sub>`);

        return `<span class="math">${expr}</span>`;
    });

    // 3. Escape HTML inside code blocks
    html = html.replace(
        /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
        (match, code) => {
            const escaped = code
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            return match.replace(code, escaped);
        }
    );

    // 4. Rewrite image paths + detect size parameter
    html = html.replace(
    /<img([^>]+)src="([^"]+)"([^>]*)>\s*\{size=(small|medium|large)\}/g,
    (match, before, src, after, size) => {
        const sizeClass = `img-size-${size}`;

        // resolve relative paths
        if (!/^https?:\/\//i.test(src)) {
            const filename = src.split("/").pop().replace(/^\.\//, "");
            src = `notes/${className}/assets/${filename}`;
        }

        return `<img class="${sizeClass}" ${before}src="${src}"${after}>`;
    }
    );


    // 5. Hide empty bullets
     html = html.replace(
        /<li>\s*<ul>[\s\S]*?<\/ul>\s*<\/li>/g,
        match => match.replace("<li>", `<li class="empty-li">`)
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






