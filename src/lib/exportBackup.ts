import { saveBackup } from '@/lib/backup';
import { notify } from '@/lib/platform';
import { useStore } from '@/store/useStore';

/** Exports a backup and, when it was really saved or shared, notes the time. */
export async function exportBackup(): Promise<void> {
  const { exportData, updateSettings } = useStore.getState();
  try {
    if (await saveBackup(exportData())) updateSettings({ lastExportAt: Date.now() });
  } catch {
    notify('Export failed', 'Something went wrong while saving the backup. Try again.');
  }
}
