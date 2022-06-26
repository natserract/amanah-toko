import { ipcRenderer } from 'electron';
import { IPC_ACTIONS } from './message';

export async function makePDF(html: string, savePath: string) {
  const success = await ipcRenderer.invoke(
    IPC_ACTIONS.SAVE_HTML_AS_PDF,
    html,
    savePath
  );

  if (success) {
    console.log(`Save as PDF Successful`)
  } else {
    console.error(`Failed`)
  }
}
