// polyfill for crypto
globalThis.crypto = require("crypto");
import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from "electron";
import { Torrent } from "./main/torrent";
import Store from "electron-store";
import MPV from "node-mpv";
import log from "electron-log";
import os from "os";
import path from "path";

let mpv: any;
const store = new Store();
const WEBAPP_URL = app.isPackaged
  ? "https://beeapp.fly.dev"
  : "http://localhost:3000";

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
    transparent: true,
  });

  // and load the index.html of the app.
  // mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // load webapp url
  mainWindow.loadURL(WEBAPP_URL);

  // Open the DevTools.
  if (!app.isPackaged) mainWindow.webContents.openDevTools();

  if (app.isPackaged) Menu.setApplicationMenu(null);

  globalShortcut.register("f5", function () {
    mainWindow.reload();
  });

  globalShortcut.register("CommandOrControl+R", function () {
    mainWindow.reload();
  });

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  let winID: number;
  const win = createWindow();
  let hbuf = win.getNativeWindowHandle();

  if (os.endianness() == "LE") {
    winID = hbuf.readInt32LE();
  } else {
    winID = hbuf.readInt32BE();
  }

  const torrent = new Torrent();

  ipcMain.handle("torrent-init", () => torrent.init());

  ipcMain.handle("torrent-seed", (event, meta, ...args) =>
    torrent.seed(event, meta, ...args)
  );

  ipcMain.handle("torrent-destroy-all", () => torrent.destroyAll());

  ipcMain.handle("torrent-destroy", (event, infoHash, ...args) =>
    torrent.destroy(event, infoHash, ...args)
  );

  ipcMain.handle("mpv-play", async (event, url, ...args) => {
    log.info("MPV", "play", winID);

    let binary = path.join(__dirname, "libs/mpv/mpv");
    if (os.platform() == "win32") {
      binary = path.join(__dirname, "libs/mpv/mpv.exe");
    }
    mpv = new MPV(
      {
        binary,
      },
      [`--wid=${winID}`, "--fullscreen", "--config-dir=libs/mpv/config"]
    );
    // const mpv = new MPV({}, ["--fullscreen"]);
    mpv.on("status", (status: any) => {
      log.info("MPV", status);
      if (status.property == "fullscreen") {
        win.setFullScreen(status.value);
      }
    });
    mpv.on("quit", () => {
      log.warn("MPV", "quit by user");
      win.setFullScreen(false);
    });

    try {
      await mpv.start();
      await mpv.load(url);
    } catch (err) {
      log.error(err);
    }
  });

  ipcMain.handle("store-get", (_event, key) => {
    return store.get(key);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", async () => {
  log.info("window all closed");

  if (mpv?.isRunning()) {
    try {
      await mpv.quit();
      log.info("MPV running:", mpv.isRunning());
    } catch (err) {
      log.error(err);
    }
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
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
