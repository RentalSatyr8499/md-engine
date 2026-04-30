async function loadClasses() {
    document.title = config.siteTitle;

    const classDirs = await fetchDirectoryListing("notes/");
    const container = document.getElementById("content");

    container.innerHTML = `
        <div id="main-container">
            <h1>${config.siteTitle}</h1>
        </div>
    `;

    const main = document.getElementById("main-container");

    classDirs.forEach(name => {
        name = name.replace(/\/$/, "");
        const item = document.createElement("div");
        item.className = "noteset-item";
        item.textContent = name;
        item.onclick = () => {
            history.pushState({}, "", `/?class=${encodeURIComponent(name)}`);
            routeFromURL();
        };
        main.appendChild(item);
    });

    document.getElementById("reveal-toggle").style.display = "none";
}

async function loadNotesets(className) {
    document.title = className;

    const notesetDirs = await fetchDirectoryListing(`notes/${className}/notesets/`);
    const container = document.getElementById("content");

    container.innerHTML = `
        <div id="main-container">
            <h1>${className}</h1>
        </div>
    `;

    const main = document.getElementById("main-container");

    notesetDirs.forEach(name => {
        name = name.replace(/\/$/, "");
        const item = document.createElement("div");
        item.className = "noteset-item";
        item.textContent = name;
        item.onclick = () => {
            history.pushState({}, "", `/?class=${encodeURIComponent(className)}&noteset=${encodeURIComponent(name)}`);
            routeFromURL();
        };
        main.appendChild(item);
    });

    document.getElementById("reveal-toggle").style.display = "none";
}

async function loadNoteset(className, notesetName) {
    document.title = `${className} | ${notesetName}`;

    const description = await fetchNotesetDescription(className, notesetName);
    const container = renderNotesetShell(className, notesetName, description);

    const files = await loadMarkdownFiles(className, notesetName);
    document.getElementById("loading-message").remove();

    for (const { file, md } of files) {
        const noteTitle = file.slice(3).replace(".md", "");

        const header = document.createElement("h2");
        header.textContent = noteTitle;
        header.className = "collapsible-header";
        header.title = "click to toggle collapse";

        const content = document.createElement("div");
        content.className = "note-content collapsible-content";

        applyCollapsibleBehavior(header, content);
        container.appendChild(header);
        container.appendChild(content);

        content.innerHTML = transformMarkdown(marked.parse(md), className);
        content.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block));
    }

    document.getElementById("reveal-toggle").style.display = "flex";
    setupRevealToggle();
}