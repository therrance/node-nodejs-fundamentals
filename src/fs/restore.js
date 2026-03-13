import { promises as fs } from 'fs';
import { dirname, join } from 'path';

const ensureNotExists = async (path) => {
  try {
    await fs.stat(path);
    throw new Error('FS operation failed');
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw new Error('FS operation failed');
  }
};

const ensureFile = async (path) => {
  try {
    return await fs.readFile(path, 'utf8');
  } catch {
    throw new Error('FS operation failed');
  }
};

const parseSnapshot = (json) => JSON.parse(json);

const writeEntry = async (base, entry) => {
  const targetPath = join(base, entry.path);
  if (entry.type === 'directory') {
    await fs.mkdir(targetPath, { recursive: true });
    return;
  }
  if (entry.type === 'file') {
    await fs.mkdir(dirname(targetPath), { recursive: true });
    const content = Buffer.from(entry.content, 'base64');
    await fs.writeFile(targetPath, content);
    return;
  }
  throw new Error('FS operation failed');
};

const createStructure = (entries, base) =>
  Promise.all(entries.map((entry) => writeEntry(base, entry)));

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  const snapshotPath = join(process.cwd(), 'snapshot.json');
  const restoredRoot = join(process.cwd(), 'workspace_restored');

  await ensureNotExists(restoredRoot);
  const snapshotJson = await ensureFile(snapshotPath);
  const snapshot = parseSnapshot(snapshotJson);

  await fs.mkdir(restoredRoot, { recursive: true });
  await createStructure(snapshot.entries, restoredRoot);
};

await restore();
