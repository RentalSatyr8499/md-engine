function renderNotesetShell(className, notesetName, description) {
    const container = document.getElementById("content");

    container.innerHTML = `
        <div class="noteset-header">
            <img src="./assets/back.png" class="back-button" alt="Back" title="view all notesets">
            <h1>${notesetName}</h1>
        </div>
        <div id="noteset-description">${description ?? ""}</div>
        <p id="loading-message">Loading notes…</p>
    `;

    document.querySelector(".back-button").onclick = () => {
        history.pushState({}, "", `/?class=${encodeURIComponent(className)}`);
        loadNotesets(className);
    };

    return container;
}

function preprocess(md) {
    return md.replace(/^(\s*)\* \s*$/gm, "$1* \u200B");
}

function transformMarkdown(html, className) {
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
            if (!/^https?:\/\//i.test(src)) {
                const filename = src.split("/").pop().replace(/^\.\//, "");
                src = `notes/${encodeURIComponent(className)}/assets/${filename}`;
            }
            return `<img class="img-size-${size}" ${before}src="${src}"${after}>`;
        }
    );

    // 5. Hide markers on empty bullets
    html = html.replace(
        /<li>&ZeroWidthSpace;<\/li>/g,
        `<li class="empty-li"></li>`
    );

    // 6. Wrap tables in a scrollable container
    html = html.replace(
        /<table>/g,
        `<div class="table-wrapper"><table>`
    ).replace(
        /<\/table>/g,
        `</table></div>`
    );
    
    // 7. Left-align cells marked with <!left>
    html = html.replace(
        /<(td|th)>%%left%%\s*/g,
        `<$1 style="text-align: left;">`
    );
    
    // 8. Collapse %%invis%% list items
    html = html.replace(
        /<li>(.*?)%%invis%%/g,
        `<li class="empty-li">$1`
    );
    return html;
}

function getPageState() {
    const contents = document.querySelectorAll(".collapsible-content");
    return [...contents].some(c => c.classList.contains("open")) ? "uncollapsed" : "collapsed";
}

function updateHamburger() {
    const toggle = document.querySelector(".main-nav-toggle");
    if (!toggle) return;
    if (getPageState() === "uncollapsed") {
        toggle.classList.add("active-menu");
    } else {
        toggle.classList.remove("active-menu");
    }
}

function collapseAll() {
    document.querySelectorAll(".collapsible-content.open").forEach(content => {
        content.classList.remove("open");
        content.style.height = content.scrollHeight + "px";
        requestAnimationFrame(() => { content.style.height = "0px"; });
    });
}

function uncollapsAll() {
    document.querySelectorAll(".collapsible-content:not(.open)").forEach(content => {
        content.classList.add("open");
        content.style.height = content.scrollHeight + "px";
        setTimeout(() => { content.style.height = "auto"; }, 300);
    });
}

function toggleNav(event) {
    event.preventDefault();
    if (getPageState() === "uncollapsed") {
        collapseAll();
    } else {
        uncollapsAll();
    }
    updateHamburger();
}


function applyCollapsibleBehavior(header, content) {
    header.onclick = () => {
        const isOpen = content.classList.toggle("open");

        if (isOpen) {
            content.style.height = content.scrollHeight + "px";
            setTimeout(() => (content.style.height = "auto"), 300);
        } else {
            content.style.height = content.scrollHeight + "px";
            requestAnimationFrame(() => { content.style.height = "0px"; });
        }

        updateHamburger(); // <-- add this line
    };
}

function setupRevealToggle() {
    const icon = document.getElementById("revealIcon");
    let revealed = false;

    document.getElementById("reveal-toggle").onclick = () => {
        revealed = !revealed;

        document.querySelectorAll(".blank").forEach(el => {
            el.classList.toggle("show", revealed);
        });

        icon.src = revealed
            ? "./assets/eye-closed.png"
            : "./assets/eye-open.png";
    };
}