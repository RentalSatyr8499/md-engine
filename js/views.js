async function d() {
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
            a();
        };


        document.getElementById("main-container").appendChild(item);
    });

    document.getElementById("reveal-toggle").style.display = "none";
    document.getElementById("presence-indicator").style.display = "none";
}

async function e(className) { 
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
            a();
        };

        document.getElementById("main-container").appendChild(item);

    });

    // document.getElementById("presence-indicator").style.display = "flex";
    document.getElementById("reveal-toggle").style.display = "none";
    g(className);
}

async function f(name, className) {
    document.title = `${className} | ${name}`;
    const container = await buildNotesetUI(name, className);

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

    // document.getElementById("presence-indicator").style.display = "flex";
    document.getElementById("reveal-toggle").style.display = "flex";
    setupRevealToggle();
}

async function b() {
    const q = "7d5a81efaff0a444b729e06ab3768a40ec82be5769c667b99810dfaeca84930a";

    if (sessionStorage.getItem("r") === "1") {
        return true;
    }

    const s = document.getElementById("content");
    s.innerHTML = `
        <div style="
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        ">
            <div style="width: 400px; text-align: center;">
                <input id="t" type="text" placeholder="what is my phone number"
                    style="width: 100%; margin-bottom: 10px;">
                <p id="u" style="color: red; display: none;">Incorrect</p>
            </div>
        </div>
    `;

    return new Promise(v => {
        document.getElementById("t").addEventListener("keydown", async (w) => {
            if (w.key === "Enter") {
                const x = w.target.value;
                const y = await c(x);

                if (y === q) {
                    sessionStorage.setItem("r", "1");
                    v(true);
                } else {
                    document.getElementById("u").style.display = "block";
                }
            }
        });
    });
}