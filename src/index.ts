// polyfill for crypto
globalThis.crypto = require("crypto");
import "dotenv/config";
import { app, BrowserWindow } from "electron";
import { torrent } from "./main/torrent";
import ipcHandlers from "./main/ipc-handlers";
import log from "electron-log";
import process from "process";
import path from "path";
import windows from "./main/windows";

const WEBAPP_URL = app.isPackaged ? "https://b.movie" : "http://localhost:3000";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("bee", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("bee");
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (windows.main.win) {
      if (windows.main.win.isMinimized()) windows.main.win.restore();
      windows.main.win.focus();
    }

    const url = commandLine.pop();
    windows.main.win.loadURL(url.replace("bee://", WEBAPP_URL + "/"));
  });

  // Create mainWindow, load the rest of the app, etc...
  app.on("ready", () => {
    windows.main.init();
    ipcHandlers();
  });

  app.on("open-url", (_event, url) => {
    windows.main.win.loadURL(url.replace("bee://", WEBAPP_URL + "/"));
  });
}

// Quit when all windows are closed, even on macOS.
app.on("window-all-closed", async () => {
  log.info("window all closed");

  torrent.destroyAll();
  app.quit();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    windows.main.init();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
