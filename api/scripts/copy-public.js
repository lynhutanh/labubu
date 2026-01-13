const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "public");
const dest = path.join(__dirname, "..", "dist", "public");

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  const entries = fs.readdirSync(from, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  copyDir(src, dest);
  process.exit(0);
} catch {
  process.exit(0);
}

