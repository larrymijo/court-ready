import { Share } from 'react-native';

import { todayISO } from '@/lib/dates';

/**
 * Native: hand the backup to the share sheet (Notes, Files, Mail, AirDrop…). Resolves false when
 * the sheet was closed without sharing (only iPhone reports that).
 */
export async function saveBackup(json: string): Promise<boolean> {
  const result = await Share.share({ message: json, title: `Hybrid backup ${todayISO()}` });
  return result.action !== Share.dismissedAction;
}

/** Native: no file picker in Expo Go, so backups are pasted into the text box instead. */
export const canPickBackupFile = false;

export async function pickBackupFile(): Promise<string | null> {
  return null;
}
