// build-manifest.js
const fs = require('fs');
const path = require('path');

const NOTES_DIR = path.join(__dirname, 'notes');

function generateManifest() {
  const manifest = {};

  if (!fs.existsSync(NOTES_DIR)) {
    console.error('notes/ directory not found');
    return;
  }

  const classes = fs.readdirSync(NOTES_DIR).filter(item => {
    return fs.statSync(path.join(NOTES_DIR, item)).isDirectory();
  });

  classes.forEach(className => {
    manifest[className] = {};
    const notesetsDir = path.join(NOTES_DIR, className, 'notesets');

    if (fs.existsSync(notesetsDir)) {
      const sets = fs.readdirSync(notesetsDir).filter(item => {
        return fs.statSync(path.join(notesetsDir, item)).isDirectory();
      });

      sets.forEach(setName => {
        const setPath = path.join(notesetsDir, setName);
        const files = fs.readdirSync(setPath);

        let desc = "";
        const descFile = files.find(f => f.toLowerCase() === 'desc.txt');
        if (descFile) {
          desc = fs.readFileSync(path.join(setPath, descFile), 'utf-8');
        }

        const mdFiles = files
          .filter(f => f.endsWith('.md'))
          .sort((a, b) => a.localeCompare(b));

        manifest[className][setName] = {
          description: desc,
          files: mdFiles
        };
      });
    }
  });

  fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
  console.log('Successfully generated manifest.json');
}

generateManifest();