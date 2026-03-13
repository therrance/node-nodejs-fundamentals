import { promises as fs } from 'fs';
import { join, relative, resolve } from 'path';

const isDir = (dirent) => dirent.isDirectory();
const isFile = (dirent) => dirent.isFile();

const normalizePath = (path) => path.replace(/\\/g, '/');

const readDirEntries = (basePath, currentPath) =>
  fs.readdir(currentPath, { withFileTypes: true }).then((dirents) =>
    Promise.all(
      dirents.map((dirent) => {
        const absolute = join(currentPath, dirent.name);
        const relativePath = normalizePath(relative(basePath, absolute));

        if (isDir(dirent)) {
          const dirEntry = { path: relativePath, type: 'directory' };
          return readDirEntries(basePath, absolute).then((children) => [dirEntry, ...children]);
        }

        if (isFile(dirent)) {
          return fs.readFile(absolute).then((buffer) => ({
            path: relativePath,
            type: 'file',
            size: buffer.length,
            content: buffer.toString('base64')
          }));
        }

        return null;
      })
    ).then((nested) => nested.flat().filter(Boolean))
  );

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata
  const rootPath = resolve(process.cwd());

  try {
    const stats = await fs.stat(rootPath);
    if (!stats.isDirectory()) throw new Error();
  } catch {
    throw new Error('FS operation failed');
  }

  const entries = await readDirEntries(rootPath, rootPath);
  const snapshotJson = { rootPath, entries };

  await fs.writeFile(join(rootPath, 'snapshot.json'), JSON.stringify(snapshotJson, null, 2));
};

await snapshot();
