import { Share } from 'react-native';

import { todayISO } from '@/lib/dates';

/** Native: hand the backup to the share sheet (Notes, Files, Mail, AirDrop…). */
export async function saveBackup(json: string): Promise<void> {
  await Share.share({ message: json, title: `Court-Ready backup ${todayISO()}` });
}

/** Native: no file picker in Expo Go, so backups are pasted into the text box instead. */
export const canPickBackupFile = false;

export async function pickBackupFile(): Promise<string | null> {
  return null;
}
