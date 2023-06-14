// polyfill for crypto
globalThis.crypto = require("crypto");
import "dotenv/config";
import { app, BrowserWindow, Menu, globalShortcut, shell } from "electron";
import Torrent from "./main/torrent";
import MPV from "./main/mpv";
import ipcHandlers from "./main/ipc-handlers";
import log from "electron-log";

const mpv = new MPV();
const torrent = new Torrent();
const WEBAPP_URL = app.isPackaged ? "https://b.movie" : "http://localhost:3000";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 1080,
    width: 1920,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    // https://www.electronjs.org/docs/latest/tutorial/window-customization#limitations-1
    transparent: false,
    icon: "assets/logo.ico",
  });

  // and load the index.html of the app.
  // mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // load webapp url
  mainWindow.loadURL(WEBAPP_URL);

  // Open the DevTools.
  if (!app.isPackaged)
    setTimeout(() => {
      mainWindow.webContents.openDevTools();
    }, 1000);

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
      label: "Torrent",
      submenu: [
        {
          label: "Dashboard",
          click: () => {
            mainWindow.loadURL(`${WEBAPP_URL}/torrents/dashboard`);
          },
        },
      ],
    },
    {
      role: "about",
      submenu: [
        {
          label: "Web",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://b.movie");
          },
        },
        {
          label: "DEV",
          submenu: [
            {
              label: "DevTools",
              click: () => {
                setTimeout(() => {
                  mainWindow.webContents.openDevTools();
                }, 1000);
              },
            },
            {
              label: "Github",
              click: async () => {
                const { shell } = require("electron");
                await shell.openExternal(
                  "https://github.com/b-movie/bee-desktop"
                );
              },
            },
          ],
        },
        { type: "separator" },
        {
          label: `v${require("../package.json").version}`,
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(null);

  globalShortcut.register("f5", function () {
    mainWindow.reload();
  });

  globalShortcut.register("CommandOrControl+R", function () {
    mainWindow.reload();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (new URL(url).origin === WEBAPP_URL) {
      return { action: "allow" };
    } else {
      shell.openExternal(url);
      return { action: "deny" };
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
  ipcHandlers();
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
