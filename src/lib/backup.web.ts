import { todayISO } from '@/lib/dates';

/**
 * Web: share the backup as a .json file where the browser can (iPhone and Android show the share
 * sheet: Save to Files, Drive, AirDrop…), otherwise download it.
 */
export async function saveBackup(json: string): Promise<void> {
  const file = new File([json], `court-ready-backup-${todayISO()}.json`, { type: 'application/json' });
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Court-Ready backup' });
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return; // closed the share sheet
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const canPickBackupFile = true;

/** Lets you choose a backup file; resolves with its text, or null if nothing was picked. */
export function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json,text/plain';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then(resolve, () => resolve(null));
    };
    input.click();
  });
}
