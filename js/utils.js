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
    console.log(`searching notes/${className}/notesets/${name}/ for .md files`);
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

function transformMarkdown(html) {
    // 1. Replace {{answer}} with blanks
    html = html.replace(/\{\{(.*?)\}\}/g, (_, p1) =>
        `<span class="blank" onclick="this.classList.toggle('show')">${p1}</span>`
    );

    // 2. Superscripts: x^2 → x<sup>2</sup>
    html = html.replace(/(\S)\^(\S+)/g, (m, base, sup) => `${base}<sup>${sup}</sup>`);

    // 3. Subscripts: x_2 → x<sub>2</sub>
    html = html.replace(/(\S)_(\S+)/g, (m, base, sub) => `${base}<sub>${sub}</sub>`);

    // 4. Escape HTML inside code blocks
    html = html.replace(
        /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
        (match, code) => {
            const escaped = code
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            return match.replace(code, escaped);
        }
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
  const params = new URLSearchParams(window.location.search);
  const className = params.get("class");
  const noteset = params.get("noteset");

  if (!className) {
    setupPresence("home");
    loadClasses();
    return;
  }

  if (!noteset) {
    setupPresence(className);
    loadNotesets(className);
    return;
  }

  setupPresence(className);
  loadNoteset(noteset, className);
}






