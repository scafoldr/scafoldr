import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileMap } from '@/features/code-editor/types';

/**
 * Downloads a project as a ZIP file
 * @param files - The file map containing file paths and their content
 * @param projectName - The name of the project (used for the ZIP filename)
 */
export async function downloadProjectAsZip(files: FileMap, projectName: string = 'project'): Promise<void> {
  // Check if there are files to export
  if (!files || Object.keys(files).length === 0) {
    throw new Error('No files to export. Please generate some code first.');
  }

  const zip = new JSZip();
  
  // Add each file to the ZIP
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }
  
  // Generate the ZIP blob
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Create a safe filename
  const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${safeProjectName}.zip`;
  
  // Download the file
  saveAs(blob, filename);
}