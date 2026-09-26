// notes.js
let manifestCache = null;

async function getManifest() {
    if (manifestCache) return manifestCache;
    try {
        const res = await fetch('./manifest.json');
        manifestCache = await res.json();
        return manifestCache;
    } catch (err) {
        console.error("Failed to load manifest.json:", err);
        return {};
    }
}

async function fetchClasses() {
    const manifest = await getManifest();
    return Object.keys(manifest);
}

async function fetchNotesets(className) {
    const manifest = await getManifest();
    if (!manifest[className]) return [];
    return Object.keys(manifest[className]);
}

async function fetchNotesetDescription(className, notesetName) {
    const manifest = await getManifest();
    return manifest[className]?.[notesetName]?.description || null;
}

const notesCache = new Map();

async function loadMarkdownFiles(className, notesetName) {
    const cacheKey = `${className}/${notesetName}`;
    if (notesCache.has(cacheKey)) {
        return notesCache.get(cacheKey);
    }

    const manifest = await getManifest();
    const notesetData = manifest[className]?.[notesetName];

    if (!notesetData || !notesetData.files) {
        return [];
    }

    const mdFiles = notesetData.files;

    const results = await Promise.all(
        mdFiles.map(async file => {
            // Explicitly start path with ./
            const filePath = `./notes/${encodeURIComponent(className)}/notesets/${encodeURIComponent(notesetName)}/${encodeURIComponent(file)}`;
            try {
                const res = await fetch(filePath);
                if (!res.ok) {
                    console.error(`[Fetch Failed] ${filePath} HTTP ${res.status}`);
                }
                const md = await res.text();
                return { file, md };
            } catch (err) {
                console.error(`[Fetch Error] Failed loading ${file}:`, err);
                return { file, md: "" };
            }
        })
    );

    notesCache.set(cacheKey, results);
    return results;
}