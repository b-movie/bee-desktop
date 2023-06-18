globalThis.crypto = require("crypto");
import "dotenv/config";
import { ipcMain, shell } from "electron";
import Torrent from "./torrent";
import MPV from "./mpv";
import Cast from "./cast";
import Store from "electron-store";
import log from "electron-log";
import fs from "fs";
import OpenSubtitles from "opensubtitles.com";
import {
  OPENSUBTITLES_API_KEY,
  CACHE_DIR,
  SUBTITLE_CACHE_DIR,
  TRACKERS,
} from "./constants";
import { download } from "./helpers";
import SubtitlesServer from "./subtitles-server";
import ip from "ip";

const cast = new Cast();
const mpv = new MPV();
const torrent = new Torrent();
const store = new Store();
const opensubtitles = new OpenSubtitles({
  apikey: OPENSUBTITLES_API_KEY,
});
const subtitlesServer = new SubtitlesServer();

const ipcHandlers = () => {
  // TORRENT
  ipcMain.handle("torrent-init", () => torrent.init());

  ipcMain.handle("torrent-seed", (event, meta, ...args) =>
    torrent.seed(event, meta, ...args)
  );

  ipcMain.handle("torrent-pause", (_, infoHash) => {
    return torrent.pause(infoHash);
  });

  ipcMain.handle("torrent-resume", (_, infoHash) => {
    return torrent.resume(infoHash);
  });

  ipcMain.handle("torrent-summary", () => {
    return torrent.summary();
  });

  ipcMain.handle("torrent-torrent-file", (_, infoHash) => {
    torrent.torrentFile(infoHash);
  });

  ipcMain.handle("torrent-current-state", (_, infoHash) => {
    torrent.state(infoHash);
  });

  ipcMain.handle("torrent-deselect-all", (_, infoHash) => {
    torrent.deselectAll(infoHash);
  });

  ipcMain.handle("torrent-select-file", (_, infoHash, fileIdx) => {
    torrent.selectFile(infoHash, fileIdx);
  });

  ipcMain.handle("torrent-destroy-all", () => {
    torrent.destroyAll();
    mpv.quit();
  });

  ipcMain.handle("torrent-destroy", (event, infoHash, ...args) => {
    torrent.destroy(event, infoHash, ...args);
    mpv.quit();
  });

  // FS
  ipcMain.handle("fs-read-file", (_, path) => {
    return fs.readFileSync(path);
  });

  ipcMain.handle("fs-download", (_, url, path) => {
    return download(url, path);
  });

  // MPV
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

  // CAST
  ipcMain.handle("cast-init", () => {
    log.info("cast-init");
    cast.init();
  });

  ipcMain.handle("cast-devices", () => {
    return cast.availableDevices();
  });

  ipcMain.handle("cast-update", () => {
    return cast.update();
  });

  ipcMain.handle("cast-play", (_event, host, media: CastMedia) => {
    cast.play(host, media);
  });

  ipcMain.handle("cast-pause", () => {
    cast.pause();
  });

  ipcMain.handle("cast-resume", () => {
    cast.resume();
  });

  ipcMain.handle("cast-stop", () => {
    cast.stop();
  });

  ipcMain.handle("cast-current-status", (_event) => {
    return cast.currentStatus();
  });

  // SHELL
  ipcMain.handle("shell-open-external", (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle("shell-open-path", (_event, path) => {
    shell.openPath(path);
  });

  // STORE
  ipcMain.handle("store-get", (_event, key) => {
    return store.get(key);
  });

  // OPENSUBTITLES
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

  ipcMain.handle("subtitles-server-serve", (_event, path) => {
    log.debug("subtitles-server-serve", path);
    return subtitlesServer.serve(path);
  });

  ipcMain.handle(
    "subtitles-server-download",
    async (_event, url, options: { fileName?: string; format?: string }) => {
      log.debug("subtitles-server-download", url);
      try {
        const dest = await download(url, SUBTITLE_CACHE_DIR, options.fileName);
        return subtitlesServer.serve(dest);
      } catch (err) {
        log.error("subtitles-server-download", err);
        return null;
      }
    }
  );

  // SETTINGS
  ipcMain.handle("settings-refresh", () => {
    return {
      cacheDir: CACHE_DIR,
      subtitlesCacheDir: SUBTITLE_CACHE_DIR,
      trackers: TRACKERS,
    };
  });

  // CLIENT
  ipcMain.handle("client-ip", () => {
    return ip.address();
  });
};

export default ipcHandlers;
