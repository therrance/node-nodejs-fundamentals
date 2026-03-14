import { promises as fs } from 'fs';
import { join, relative } from 'path';

const parseArgs = (args) => {
  const extIndex = args.indexOf('--ext');
  const ext = extIndex !== -1 && args[extIndex + 1] ? args[extIndex + 1] : 'txt';
  return { ext };
};

const validateWorkspace = async (path) => {
  try {
    const stat = await fs.stat(path);
    if (!stat.isDirectory()) throw new Error();
  } catch {
    throw new Error('FS operation failed');
  }
};

const collectFiles = async (base, current, ext) => {
  const entries = await fs.readdir(current, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(base, fullPath, ext);
      } else if (entry.isFile() && entry.name.endsWith('.' + ext)) {
        return [relative(base, fullPath)];
      }
      return [];
    })
  );
  return results.flat();
};

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  const { ext } = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  await validateWorkspace(root);
  const files = await collectFiles(root, root, ext);
  files.sort();
  console.log(files.join('\n'));
};

await findByExt();
