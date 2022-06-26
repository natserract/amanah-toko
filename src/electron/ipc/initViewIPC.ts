import { app } from 'electron';

import i18n from '../i18next';
import { getMainMenu } from '../menu';
import { getViewState } from '../utils/manageViewState';
import { IPC_ACTIONS } from '../utils/message';
import { saveHtmlAsPdf } from '../utils/saveHtmlToPdf';
import {
  navGoBack,
  navGoForward,
  navReload,
  setMainIPC,
  syncNavStat,
} from './utils';

export const initViewIPC = () => {
  setMainIPC
    .handle('history-go-back', () => {
      navGoBack();
      syncNavStat();
    })
    .handle('history-go-forward', () => {
      navGoForward();
      syncNavStat();
    })
    .handle('history-refresh', () => {
      navReload();
      syncNavStat();
    })
    .handle('open-main-menu', () => {
      const { wrapperContents } = getViewState();
      if (!wrapperContents) return;

      // 메인 메뉴를 context menu 팝업으로 연다.
      getMainMenu(i18n).popup({
        x: 20,
        y: 38,
      });
    })
    .handle(
      IPC_ACTIONS.SAVE_HTML_AS_PDF,
      async (_event, html, savePath) => {
        return await saveHtmlAsPdf(html, savePath, app);
      }
    );
};
