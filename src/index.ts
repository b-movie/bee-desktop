// polyfill for crypto
globalThis.crypto = require("crypto");
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  globalShortcut,
  shell,
} from "electron";
import { Torrent } from "./main/torrent";
import { MPV } from "./main/mpv";
import Store from "electron-store";
import log from "electron-log";
import dlnacasts from "dlnacasts";

const mpv = new MPV();
const torrent = new Torrent();
const store = new Store();
const cast = dlnacasts();
const WEBAPP_URL = app.isPackaged ? "https://b.movie" : "http://localhost:3000";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
// declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 1024,
    width: 1280,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    icon: "assets/logo.ico",
  });

  // and load the index.html of the app.
  // mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // load webapp url
  mainWindow.loadURL(WEBAPP_URL);

  // Open the DevTools.
  if (!app.isPackaged) mainWindow.webContents.openDevTools();

  const menu = Menu.buildFromTemplate([
    {
      role: "appMenu",
      label: "BEE",
      submenu: [
        {
          label: "Home",
          click: () => {
            mainWindow.loadURL(WEBAPP_URL);
          },
        },
        { role: "reload" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "DevTools",
          click: () => {
            mainWindow.webContents.openDevTools();
          },
        },
        {
          label: "Github",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://github.com/b-movie/bee-desktop");
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  globalShortcut.register("f5", function () {
    mainWindow.reload();
  });

  globalShortcut.register("CommandOrControl+R", function () {
    mainWindow.reload();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  ipcMain.handle("torrent-init", () => torrent.init());

  ipcMain.handle("torrent-seed", (event, meta, ...args) =>
    torrent.seed(event, meta, ...args)
  );

  ipcMain.handle("torrent-current-state", (_, infoHash) => {
    torrent.state(infoHash);
  });

  ipcMain.handle("torrent-destroy-all", () => {
    torrent.destroyAll();
    mpv.quit();
  });

  ipcMain.handle("torrent-destroy", (event, infoHash, ...args) => {
    torrent.destroy(event, infoHash, ...args);
    mpv.quit();
  });

  ipcMain.handle("mpv-play", (event, url, options) => {
    mpv.load(event, url, options);
  });

  ipcMain.handle("mpv-go-to-position", (_, position) => {
    log.info("go to position", position);
    mpv.goToPosition(position);
  });

  ipcMain.handle("mpv-get-time-position", () => {
    return mpv.getTimePosition();
  });

  ipcMain.handle("mpv-get-percent-position", () => {
    return mpv.getPercentPosition();
  });

  ipcMain.handle("mpv-get-property", (_, property) => {
    return mpv.getProperty(property);
  });

  ipcMain.handle("mpv-is-running", () => {
    return mpv.isRunning();
  });

  ipcMain.handle("mpv-quit", () => {
    mpv.quit();
  });

  ipcMain.handle("cast-players", () => {
    cast.update();
    return cast.players;
  });

  ipcMain.handle("cast-play", (_event, url, host, options = {}) => {
    const player = cast.update().players.find((p: any) => p.host === host);
    player.play(url, options);
  });

  ipcMain.handle("shell-open-external", (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle("store-get", (_event, key) => {
    return store.get(key);
  });
});

// Quit when all windows are closed, even on macOS.
app.on("window-all-closed", async () => {
  log.info("window all closed");

  torrent.destroyAll();
  mpv.quit();
  app.quit();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
