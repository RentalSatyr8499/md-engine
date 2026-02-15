async function loadClasses() {
    document.title = "MD Engine";
    const classDirs = await fetchDirectoryListing("notes/");
    const container = document.getElementById("content");
    container.innerHTML = `
        <div id="main-container">
            <h1>${config.siteTitle}</h1>
        </div>
    `;

    console.log(`loading the following class directories: ${classDirs}`)

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
    document.getElementById("presence-indicator").style.display = "none";
}

async function loadNotesets(className) { 
    document.title = `${className}: notesets`;

    const notesetDirs = await fetchDirectoryListing(`notes/${className}/notesets/`); 
    

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

async function loadNoteset(name, className) {
    document.title = `${className} | ${name}`;
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
        html = transformMarkdown(html, className, name);

        content.innerHTML = html;

        content.querySelectorAll("pre code").forEach(block => {
            hljs.highlightElement(block);
        });
    }

    document.getElementById("presence-indicator").style.display = "flex";
    document.getElementById("reveal-toggle").style.display = "flex";
    setupRevealToggle();
}