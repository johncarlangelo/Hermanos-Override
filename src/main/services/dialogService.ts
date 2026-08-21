import { dialog, BrowserWindow } from 'electron';
import type { SelectFileOptions } from '../../shared/types';

export class DialogService {
  public static async selectFile(
    window: BrowserWindow | null,
    options?: SelectFileOptions
  ): Promise<string | null> {
    const filters = [];
    if (options?.extensions && options.extensions.length > 0) {
      filters.push({
        name: options.filterName || 'Executables',
        extensions: options.extensions
      });
    }
    filters.push({ name: 'All Files', extensions: ['*'] });

    const result = window
      ? await dialog.showOpenDialog(window, {
          title: options?.title || 'Select File',
          defaultPath: options?.defaultPath,
          properties: ['openFile'],
          filters
        })
      : await dialog.showOpenDialog({
          title: options?.title || 'Select File',
          defaultPath: options?.defaultPath,
          properties: ['openFile'],
          filters
        });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  }
}
