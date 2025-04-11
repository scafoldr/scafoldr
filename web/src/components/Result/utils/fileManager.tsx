import { Directory, File, FileMap, Type } from '../types';

export function findFileByName(rootDir: Directory, filename: string): File | undefined {
  let targetFile: File | undefined = undefined;

  function findFile(rootDir: Directory, filename: string) {
    rootDir.files.forEach((file) => {
      if (file.name === filename) {
        targetFile = file;
        return;
      }
    });
    rootDir.dirs.forEach((dir) => {
      findFile(dir, filename);
    });
  }

  findFile(rootDir, filename);
  return targetFile;
}

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
