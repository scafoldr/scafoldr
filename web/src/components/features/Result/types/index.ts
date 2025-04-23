export type FileMap = Record<string, string>;

// BUG: Eslint config false positive on enum
export enum Type {
  // eslint-disable-next-line no-unused-vars
  FILE,
  // eslint-disable-next-line no-unused-vars
  DIRECTORY,
  // eslint-disable-next-line no-unused-vars
  DUMMY
}

interface CommonProps {
  id: string;
  type: Type;
  name: string;
  parentId: string | undefined;
  depth: number;
}

export interface File extends CommonProps {
  content: string;
}

export interface Directory extends CommonProps {
  files: File[];
  dirs: Directory[];
}
