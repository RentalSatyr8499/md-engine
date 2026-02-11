# MDengine

I built this engine that renders my class notes for school (.md files) into fill-in-the-blank-style study guides. Aaaand, this project is live!: https://probable-tribble.fly.dev

## Software design highlights

### 😮 URL query parameters
Instead of serving static files, the backend uses **query parameters** (ex. `?class=CS3130&noteset=Midterm1`) to dynamically render notes. This allows me to share URLS easily, reduce redunancy in my code, and render notes on-demand. All the noteset structures are driven by the noteset file system (the engine scans the directory independently to see what needs to be loaded). So no manifest is needed.

### 😮 Presence tracking
This project uses a WebSocket-base presence system:
- Shows **online** (active in last 60s) and **idle** counts
- Tracks the number of people online in individual class notes (not collectively across the entire website). So the system also separates user presences by "rooms".

### 😮 .md rendering and other UI features
Customized .md rendering rules:
- **`{{answer}}`**: click to hide/reveal the part of the statement (good for active recall, which is the entire point of the website). All blanks can be toggled at the same time as well.
- **`text^sup`**: Automatic superscript rendering
- **`text_sub`**: Automatic subscript rendering
- **Code**: code blocks highlighted with highlight.js
Other UI features:
- **Asset path resolution**: Images automatically resolve from assets folder
- **Collapsible sections**: headers can be clicked to expanded/collapsed using CSS animation

### 😮 Asset caching
Markdown files are cached after the first load, reducing bandwidth and making navigation snappy even on slow connections.

## Tech Stack
- **Backend**: Node.js HTTP server with WebSocket support
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Rendering**: [marked.js](https://marked.js.org/) for markdown, [highlight.js](https://highlightjs.org/) for code
- **Deployment**: Docker + [Fly.io](https://fly.io)

## Getting Started

If you want to run MDengine to make your own awesome notes!....:

### Local development
```bash
npm install
npm start
```

then 

```bash
node js/server.js
```

Then it should say something like, `Server listening on 3000`. Then, in a seperate console, 

```bash
npx serve
```

then it should tell you what the localhost address is you can see the current site on.

### Add Notes
So here's how MDengine works: one .md file corresponds to a *note*. *Notes* in turn belong to a *noteset*, and finally *notesets* belong to a *class* (like a course). I added the noteset layer so that you can organize class notes by unit or midterm.
1. Create folders under `notes/`. In the project root:
   ```
   mkdir notes/[class-name]/notesets/[noteset-name]
   mkdir notes/[class-name]/assets
   ```
2. Add markdown files with numeric prefixes (e.g., `01 intro.md`, `02 building.md`). Notes will appear in the reverse order of their numbering (so most recent notes are at the top). Custom markdown features you can use:
- Enclose a phrase in {{}} to make it fill-in-the-blank.
- Use `^` for superscript and `_` for subscript.
- Encode content in three backticks (\`\`\`\n) for a code block, and one backtick (\`) for inline code.
- Place images in the assets folder and simply put their actual name as the path. The path will resolve automatically for you.

### Deployment
Run `fly launch` in the console, and make sure to use the existing `fly.toml` and `package.json`. Everything should already be configured for stuff to work on fly for you. Happy MDengining!

