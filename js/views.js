// views.js

async function loadClasses() {
    document.title = config.siteTitle;

    // Fetches top-level keys from manifest.json
    const classDirs = await fetchClasses();
    const container = document.getElementById("content");

    container.innerHTML = `
        <div id="main-container">
            <h1>${config.siteTitle}</h1>
        </div>
    `;

    const main = document.getElementById("main-container");

    classDirs.forEach(name => {
        const item = document.createElement("div");
        item.className = "noteset-item";
        item.textContent = name;
        item.onclick = () => {
            // Relative pushState: no leading "/", so this preserves whatever
            // subpath the site is actually served under (e.g. GitHub Pages
            // project sites at /<repo>/). An absolute "/?class=..." here
            // would silently rewrite the URL to the domain root, breaking
            // every subsequent relative fetch (./notes/..., ./assets/...).
            history.pushState({}, "", `?class=${encodeURIComponent(name)}`);
            routeFromURL();
        };
        main.appendChild(item);
    });

    document.getElementById("reveal-toggle").style.display = "none";
    document.getElementById("hamburger").style.display = "none";
}

async function loadNotesets(className) {
    document.title = className;

    // Fetches noteset keys for the specific class from manifest.json
    const notesetDirs = await fetchNotesets(className);
    const container = document.getElementById("content");

    container.innerHTML = `
        <div id="main-container">
            <h1>${className}</h1>
        </div>
    `;

    const main = document.getElementById("main-container");

    notesetDirs.forEach(name => {
        const item = document.createElement("div");
        item.className = "noteset-item";
        item.textContent = name;
        item.onclick = () => {
            // Same fix: relative, no leading "/".
            history.pushState({}, "", `?class=${encodeURIComponent(className)}&noteset=${encodeURIComponent(name)}`);
            routeFromURL();
        };
        main.appendChild(item);
    });

    document.getElementById("reveal-toggle").style.display = "none";
    document.getElementById("hamburger").style.display = "none";
}

async function loadNoteset(className, notesetName) {
    document.title = `${className} | ${notesetName}`;

    const description = await fetchNotesetDescription(className, notesetName);
    const container = renderNotesetShell(className, notesetName, description);

    const files = await loadMarkdownFiles(className, notesetName);
    const loadingMsg = document.getElementById("loading-message");
    if (loadingMsg) loadingMsg.remove();

    console.log(`[Rendering Noteset] Total files fetched: ${files.length}`);

    for (const { file, md } of files) {
        console.log(`[Processing File] ${file}`);

        if (!md || md.trim() === "") {
            console.warn(`[Warning] ${file} is empty or failed to load.`);
            continue;
        }

        const noteTitle = file.replace(/^\d+\s*/, "").replace(/\.md$/i, "");

        const header = document.createElement("h2");
        header.textContent = noteTitle;
        header.className = "collapsible-header";
        header.title = "click to toggle collapse";

        const content = document.createElement("div");
        content.className = "note-content collapsible-content";

        applyCollapsibleBehavior(header, content);
        container.appendChild(header);
        container.appendChild(content);

        try {
            const rawHTML = marked.parse(preprocess(md));
            const transformedHTML = transformMarkdown(rawHTML, className, notesetName);
            content.innerHTML = transformedHTML;
        } catch (parseError) {
            console.error(`[Parse Error] ${file} failed during marked/transform:`, parseError);
        }

        content.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block));
    }

    document.getElementById("reveal-toggle").style.display = "flex";
    document.getElementById("hamburger").style.display = "flex";

    setupRevealToggle();
}