import { Fragment, useState } from 'react';
import { Directory, File } from './types';
import { sortDir, sortFile } from './utils/fileManager';
import { getIcon } from './utils/icon';

interface FileTreeProps {
  rootDir: Directory;
  selectedFile: File | undefined;
  // eslint-disable-next-line no-unused-vars
  onSelect: (file: File) => void;
}

export const FileTree = (props: FileTreeProps) => {
  return <SubTree directory={props.rootDir} {...props} />;
};

interface SubTreeProps {
  directory: Directory;
  selectedFile: File | undefined;
  // eslint-disable-next-line no-unused-vars
  onSelect: (file: File) => void;
}

const SubTree = (props: SubTreeProps) => {
  return (
    <div>
      {props.directory.dirs.sort(sortDir).map((dir) => (
        <Fragment key={dir.id}>
          <DirDiv directory={dir} selectedFile={props.selectedFile} onSelect={props.onSelect} />
        </Fragment>
      ))}
      {props.directory.files.sort(sortFile).map((file) => (
        <Fragment key={file.id}>
          <FileDiv
            file={file}
            selectedFile={props.selectedFile}
            onClick={() => props.onSelect(file)}
          />
        </Fragment>
      ))}
    </div>
  );
};

const FileDiv = ({
  file,
  icon,
  selectedFile,
  onClick
}: {
  file: File | Directory;
  icon?: string;
  selectedFile: File | undefined;
  onClick: () => void;
}) => {
  const isSelected = (selectedFile && selectedFile.id === file.id) as boolean;
  const depth = file.depth;
  return (
    <div
      style={{ paddingLeft: `${depth * 16}px` }}
      className={`flex items-center ${
        isSelected ? 'bg-gray-700' : 'bg-transparent'
      } hover:cursor-pointer hover:bg-gray-500`}
      onClick={onClick}>
      <FileIcon name={icon} extension={file.name.split('.').pop() || ''} />
      <span style={{ marginLeft: 1 }}>{file.name}</span>
    </div>
  );
};

const DirDiv = ({
  directory,
  selectedFile,
  onSelect
}: {
  directory: Directory;
  selectedFile: File | undefined;
  // eslint-disable-next-line no-unused-vars
  onSelect: (file: File) => void;
}) => {
  let defaultOpen = false;
  if (selectedFile) defaultOpen = isChildSelected(directory, selectedFile);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <FileDiv
        file={directory}
        icon={open ? 'openDirectory' : 'closedDirectory'}
        selectedFile={selectedFile}
        onClick={() => setOpen(!open)}
      />
      {open ? (
        <SubTree directory={directory} selectedFile={selectedFile} onSelect={onSelect} />
      ) : null}
    </>
  );
};

const isChildSelected = (directory: Directory, selectedFile: File) => {
  let res: boolean = false;

  function isChild(dir: Directory, file: File) {
    if (selectedFile.parentId === dir.id) {
      res = true;
      return;
    }
    if (selectedFile.parentId === '0') {
      res = false;
      return;
    }
    dir.dirs.forEach((item) => {
      isChild(item, file);
    });
  }

  isChild(directory, selectedFile);
  return res;
};

const FileIcon = ({ extension, name }: { name?: string; extension?: string }) => {
  const icon = getIcon(extension || '', name || '');
  return <span className="flex w-8 h-8 justify-center items-center">{icon}</span>;
};
