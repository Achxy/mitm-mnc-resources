import { promises as fs } from "fs";
import path from "path";

const ROOT_LABEL = "Contents";
const ROOT_WEB_PATH = "/contents";
const CONTENTS_DIR = path.resolve("contents");
const OUTPUT_FILE = path.resolve("resources-manifest.json");

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

const sortEntries = (entries) =>
  entries.slice().sort((a, b) => {
    const aIsDir = a.isDirectory();
    const bIsDir = b.isDirectory();
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return collator.compare(a.name, b.name);
  });

const getExtension = (fileName) => {
  const ext = path.extname(fileName);
  return ext ? ext.slice(1).toLowerCase() : "";
};

const buildChildren = async (fsDirPath, webDirPath) => {
  const entries = await fs.readdir(fsDirPath, { withFileTypes: true });
  const sorted = sortEntries(entries);

  const children = [];
  for (const entry of sorted) {
    const entryFsPath = path.join(fsDirPath, entry.name);
    const entryWebPath = path.posix.join(webDirPath, entry.name);

    if (entry.isDirectory()) {
      children.push({
        type: "directory",
        name: entry.name,
        path: entryWebPath,
        children: await buildChildren(entryFsPath, entryWebPath),
      });
    } else {
      children.push({
        type: "file",
        name: entry.name,
        path: entryWebPath,
        extension: getExtension(entry.name),
      });
    }
  }

  return children;
};

const generateManifest = async () => {
  const stats = await fs.stat(CONTENTS_DIR).catch(() => null);
  if (!stats || !stats.isDirectory()) {
    throw new Error("`contents` directory not found or is not a directory.");
  }

  const manifest = {
    rootLabel: ROOT_LABEL,
    rootPath: ROOT_WEB_PATH,
    children: await buildChildren(CONTENTS_DIR, ROOT_WEB_PATH),
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Manifest written to ${OUTPUT_FILE}`);
};

generateManifest().catch((error) => {
  console.error(error);
  process.exit(1);
});
