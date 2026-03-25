import fs from 'fs';
import path from 'path';

let isLoaded = false;

export function loadEnv(): void {
  if (isLoaded) {
    return;
  }

  const envFilePath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envFilePath)) {
    isLoaded = true;
    return;
  }

  const contents = fs.readFileSync(envFilePath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    process.env[key] = value;
  }

  isLoaded = true;
}
