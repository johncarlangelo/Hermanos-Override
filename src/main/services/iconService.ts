import { app } from 'electron';
import fs from 'fs';
import path from 'path';

/**
 * Extracts the embedded icon from a Windows executable and stores it as a
 * PNG under <dataDir>/icons/<gameId>.png so it can be served through the
 * app-asset protocol. Best-effort: any failure returns null and leaves the
 * game record untouched.
 */
export async function extractGameIcon(
  dataDir: string,
  gameId: string,
  exePath: string
): Promise<string | null> {
  try {
    if (!exePath || !fs.existsSync(exePath)) return null;

    const image = await app.getFileIcon(exePath, { size: 'large' });
    if (image.isEmpty()) return null;

    const png = image.toPNG();
    if (!png || png.length === 0) return null;

    const iconsDir = path.join(dataDir, 'icons');
    await fs.promises.mkdir(iconsDir, { recursive: true });

    const iconPath = path.join(iconsDir, `${gameId}.png`);
    await fs.promises.writeFile(iconPath, png);
    return iconPath;
  } catch (err) {
    console.warn(`Icon extraction failed for "${exePath}":`, err);
    return null;
  }
}
