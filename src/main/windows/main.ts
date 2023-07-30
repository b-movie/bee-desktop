import {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  shell,
  dialog,
} from "electron";
import log from "electron-log";

const WEBAPP_URL = app.isPackaged ? "https://b.movie" : "http://localhost:3000";
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const main = {
  win: null as BrowserWindow | null,
  init: () => {},
};

main.init = (): void => {
  if (main.win) {
    main.win.show();
    return;
  }

  // Create the browser window.
  main.win = new BrowserWindow({
    backgroundColor: "#0d0d0d",
    height: 1080,
    width: 1920,
    minWidth: 1280,
    minHeight: 720,
    titleBarStyle: "hiddenInset", // Hide title bar (Mac)
    useContentSize: true, // Specify web page size without OS chrome
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
    // https://www.electronjs.org/docs/latest/tutorial/window-customization#limitations-1
    transparent: false,
    icon: "assets/logo.ico",
  });

  // and load the index.html of the app.
  // win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // load webapp url
  main.win.loadURL(WEBAPP_URL);

  // Open the DevTools.
  if (!app.isPackaged)
    setTimeout(() => {
      main.win.webContents.openDevTools();
    }, 1000);

  Menu.setApplicationMenu(null);

  globalShortcut.register("f5", () => {
    main.win.reload();
  });

  globalShortcut.register("CommandOrControl+R", () => {
    main.win.reload();
  });

  main.win.webContents.setWindowOpenHandler(({ url }) => {
    if (new URL(url).origin === WEBAPP_URL) {
      return { action: "allow" };
    } else {
      shell.openExternal(url);
      return { action: "deny" };
    }
  });

  process.on("uncaughtException", (error) => {
    log.error(error);
    dialog.showErrorBox("Error", error.message);
  });
};
