import { Directory, File, FileMap, Type } from '../types';

export function sortDir(l: Directory, r: Directory) {
  return l.name.localeCompare(r.name);
}

export function sortFile(l: File, r: File) {
  return l.name.localeCompare(r.name);
}

export function convertToTree(fileMap: FileMap): Directory {
  const root: Directory = {
    id: 'root',
    type: Type.DIRECTORY,
    name: '/',
    parentId: undefined,
    depth: 0,
    dirs: [],
    files: []
  };

  const dirMap: Record<string, Directory> = {
    root: root
  };

  for (const fullPath in fileMap) {
    const content = fileMap[fullPath];
    const parts = fullPath.split('/');
    const currentPath = 'root';
    let parentDir = dirMap[currentPath];

    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;
      const pathId = parts.slice(0, i + 1).join('/');

      if (isFile) {
        const file: File = {
          id: pathId,
          type: Type.FILE,
          name: part,
          parentId: parentDir.id,
          depth: i + 1,
          content
        };
        parentDir.files.push(file);
      } else {
        if (!dirMap[pathId]) {
          const dir: Directory = {
            id: pathId,
            type: Type.DIRECTORY,
            name: part,
            parentId: parentDir.id,
            depth: i + 1,
            dirs: [],
            files: []
          };
          dirMap[pathId] = dir;
          parentDir.dirs.push(dir);
        }
        parentDir = dirMap[pathId];
      }
    });
  }

  return root;
}

export function findFileByPath(rootDir: Directory, path: string): File | undefined {
  // Normalize the path by removing leading and trailing slashes
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');

  // If path is empty, return undefined
  if (!normalizedPath) return undefined;

  // Split the path into parts
  const parts = normalizedPath.split('/');

  // Start from the root directory
  let currentDir: Directory = rootDir;

  // Traverse the directory structure for all parts except the last one (which is the file)
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // Find the subdirectory with the matching name
    const nextDir = currentDir.dirs.find((dir) => dir.name === part);

    // If directory not found, return undefined
    if (!nextDir) return undefined;

    // Move to the next directory
    currentDir = nextDir;
  }
  // The last part is the file name
  const fileName = parts[parts.length - 1];

  // Find and return the file with the matching name in the current directory
  return currentDir.files.find((file) => file.name === fileName);
}
