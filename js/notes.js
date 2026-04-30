async function fetchDirectoryListing(path) {
    const res = await fetch(path);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const base = "/" + path.replace(/\/$/, "");

    const allHrefs = [...doc.querySelectorAll("a")].map(a => a.getAttribute("href"));

    return allHrefs
        .filter(href => href && href !== "../")
        .filter(href => href.startsWith(base + "/"))
        .filter(href => {
            const rel = href.slice(base.length + 1);
            return rel.split("/").filter(Boolean).length === 1;
        })
        .map(href => href.slice(base.length + 1))
        .filter(name => !name.startsWith("."));
}

async function fetchNotesetDescription(className, notesetName) {
    const basePath = `notes/${encodeURIComponent(className)}/notesets/${encodeURIComponent(notesetName)}/`;
    const files = await fetchDirectoryListing(basePath);
    const descFile = files.find(f => f.toLowerCase() === "desc.txt");

    if (!descFile) return null;

    try {
        return await fetch(basePath + descFile).then(r => r.text());
    } catch (err) {
        console.error("Failed to load desc.txt:", err);
        return null;
    }
}

const notesCache = new Map();

async function loadMarkdownFiles(className, notesetName) {
    const cacheKey = `${className}/${notesetName}`;
    if (notesCache.has(cacheKey)) {
        return notesCache.get(cacheKey);
    }

    const files = await fetchDirectoryListing(`notes/${className}/notesets/${notesetName}/`);
    const mdFiles = files
        .filter(n => n.endsWith(".md"))
        .sort((a, b) => a.localeCompare(b));

    const results = await Promise.all(
        mdFiles.map(async file => {
            const md = await fetch(`notes/${encodeURIComponent(className)}/notesets/${encodeURIComponent(notesetName)}/${file}`).then(r => r.text());
            return { file, md };
        })
    );

    notesCache.set(cacheKey, results);
    return results;
}