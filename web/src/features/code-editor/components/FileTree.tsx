import { Fragment, useState } from 'react';
import { Directory, File } from '../types';
import { sortDir, sortFile } from '../utils/fileManager';
import { getIcon } from '../utils/icon';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  // Check if the file is a directory to make space for arrow icon
  const isDirectory = (file as Directory).dirs !== undefined;
  const depth = file.depth - (isDirectory ? 1 : 0);

  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start h-8 px-2 text-xs font-normal',
        isSelected && 'bg-secondary text-secondary-foreground'
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={onClick}>
      {icon === 'openDirectory' && <ChevronDown className="w-3 h-3 mr-1" />}
      {icon === 'closedDirectory' && <ChevronRight className="w-3 h-3 mr-1" />}
      <FileIcon name={icon} extension={file.name.split('.').pop() || ''} />
      <span className="ml-2 truncate">{file.name}</span>
    </Button>
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
  return <span className="flex items-center justify-center">{icon}</span>;
};
