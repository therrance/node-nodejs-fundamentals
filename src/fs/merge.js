import { promises as fs } from 'fs';
import { join } from 'path';

const parseArgs = (args) => {
  const filesIndex = args.indexOf('--files');
  if (filesIndex !== -1 && args[filesIndex + 1]) {
    const files = args[filesIndex + 1].split(',').map(f => f.trim()).filter(f => f);
    return { files };
  }
  return { files: null };
};

const getDefaultFiles = async (partsDir) => {
  try {
    const entries = await fs.readdir(partsDir);
    const txtFiles = entries.filter(f => f.endsWith('.txt')).sort();
    if (txtFiles.length === 0) throw new Error('FS operation failed');
    return txtFiles;
  } catch {
    throw new Error('FS operation failed');
  }
};

const validateFiles = async (files, partsDir) => {
  await Promise.all(files.map(async (file) => {
    try {
      await fs.stat(join(partsDir, file));
    } catch {
      throw new Error('FS operation failed');
    }
  }));
};

const readFiles = async (files, partsDir) => {
  const contents = await Promise.all(files.map(file => fs.readFile(join(partsDir, file), 'utf8')));
  return contents.join('\n');
};

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  const partsDir = join(process.cwd(), 'parts');
  const outputFile = join(process.cwd(), 'merged.txt');
  const { files: specifiedFiles } = parseArgs(process.argv.slice(2));
  const files = specifiedFiles ? specifiedFiles : await getDefaultFiles(partsDir);
  if (specifiedFiles) {
    await validateFiles(files, partsDir);
  }
  const content = await readFiles(files, partsDir);
  await fs.writeFile(outputFile, content);
};

await merge();
