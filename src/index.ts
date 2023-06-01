// polyfill for crypto
globalThis.crypto = require("crypto");
import "dotenv/config";
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
import fs from "fs";
import OpenSubtitles from "opensubtitles.com";

const dlnacasts = require("dlnacasts2")();
const ChromecastAPI = require("chromecast-api");
const chromecast = new ChromecastAPI();
const mpv = new MPV();
const torrent = new Torrent();
const store = new Store();
const WEBAPP_URL = app.isPackaged ? "https://b.movie" : "http://localhost:3000";
const opensubtitles = new OpenSubtitles({
  apikey: process.env.OPENSUBTITLES_API_KEY,
});

log.debug("OPENSUBTITLES_API_KEY: ", process.env.OPENSUBTITLES_API_KEY);

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
    height: 1024,
    width: 1280,
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

  ipcMain.handle("torrent-init", () => torrent.init());

  ipcMain.handle("torrent-seed", (event, meta, ...args) =>
    torrent.seed(event, meta, ...args)
  );

  ipcMain.handle("torrent-summary", () => {
    return torrent.summary();
  });

  ipcMain.handle("torrent-torrent-file", (_, infoHash) => {
    torrent.torrentFile(infoHash);
  });

  ipcMain.handle("torrent-current-state", (_, infoHash) => {
    torrent.state(infoHash);
  });

  ipcMain.handle("torrent-set-priority", (_, infoHash, fileIdx, priority) => {
    torrent.setPriority(infoHash, fileIdx, priority);
  });

  ipcMain.handle("torrent-destroy-all", () => {
    torrent.destroyAll();
    mpv.quit();
  });

  ipcMain.handle("torrent-destroy", (event, infoHash, ...args) => {
    torrent.destroy(event, infoHash, ...args);
    mpv.quit();
  });

  ipcMain.handle("fs-read-file", (_, path) => {
    return fs.readFileSync(path);
  });

  ipcMain.handle("mpv-play", (event, url, options) => {
    mpv.load(event, url, options);
  });

  ipcMain.handle("mpv-pause", () => {
    mpv.pause();
  });

  ipcMain.handle("mpv-resume", () => {
    mpv.resume();
  });

  ipcMain.handle("mpv-go-to-position", (_, position) => {
    log.info("go to position", position);
    mpv.goToPosition(position);
  });

  ipcMain.handle("mpv-add-subtitles", (_, file, flag, title, lang) => {
    return mpv.addSubtitles(file, flag, title, lang);
  });

  ipcMain.handle("mpv-observe-property", (_, property) => {
    return mpv.observeProperty(property);
  });

  ipcMain.handle("mpv-unobserve-property", (_, property) => {
    return mpv.unobserveProperty(property);
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

  ipcMain.handle("dlnacasts-players", () => {
    dlnacasts.update();
    log.debug("dlnacasts-players", dlnacasts.players);
    return dlnacasts.players.map((p: any) => {
      return { name: p.name, host: p.host };
    });
  });

  ipcMain.handle("dlnacasts-play", (_event, host, url, options = {}) => {
    dlnacasts.update();
    const player = dlnacasts.players.find((p: any) => p.host === host);
    if (!player) return;
    player.play(url, options);
  });

  ipcMain.handle("chromecast-devices", () => {
    chromecast.update();
    return chromecast.devices.map((p: any) => {
      return { name: p.name, host: p.host, friendlyName: p.friendlyName };
    });
  });

  ipcMain.handle("chromecast-play", (_, host, media = {}, options = {}) => {
    log.debug("chromecast-play", host, media, options);
    chromecast.update();
    const device = chromecast.devices.find((p: any) => p.host === host);
    if (!device) return;

    device.play(media, options);
  });

  ipcMain.handle("chromecast-pause", (_event, host) => {
    log.debug("chromecast-pause", host);
    const device = chromecast.devices.find((p: any) => p.host === host);
    if (!device) return;

    device.pause();
  });

  ipcMain.handle("chromecast-resume", (_event, host) => {
    const device = chromecast.devices.find((p: any) => p.host === host);
    if (!device) return;

    device.resume();
  });

  ipcMain.handle("chromecast-stop", (_event, host) => {
    const device = chromecast.devices.find((p: any) => p.host === host);
    if (!device) return;

    device.stop();
  });

  ipcMain.handle("chromecast-current-status", async (event, host) => {
    const device = chromecast.devices.find((p: any) => p.host === host);
    if (!device) return;

    device.getStatus((err: any, status: any) => {
      if (err) return err;

      log.debug("chromecast-current-status", host, status);
      event.sender.send("chromecast-on-status", status);
    });
  });

  ipcMain.handle("chromecast-close", (_event, host) => {
    const device = chromecast.devices.find((p: any) => p.host === host);
    if (!device) return;

    device.close();
  });

  ipcMain.handle("shell-open-external", (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle("shell-open-path", (_event, path) => {
    shell.openPath(path);
  });

  ipcMain.handle("store-get", (_event, key) => {
    return store.get(key);
  });

  ipcMain.handle("opensubtitles-login", (_event, username, password) => {
    return opensubtitles.login({ username, password });
  });

  ipcMain.handle("opensubtitles-search", (_event, options = {}) => {
    return opensubtitles.subtitles(options);
  });

  ipcMain.handle("opensubtitles-download", (_event, fileId) => {
    log.debug("opensubtitles-download", fileId);
    return opensubtitles.download({ file_id: fileId });
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
