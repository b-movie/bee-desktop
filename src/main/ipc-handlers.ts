globalThis.crypto = require("crypto");
import "dotenv/config";
import { ipcMain, shell } from "electron";
import { torrent } from "./torrent";
import { ExternalPlayers, externalPlayers } from "./players";
import log from "electron-log";
import fs from "fs";
import OpenSubtitles from "opensubtitles.com";
import {
  OPENSUBTITLES_API_KEY,
  DEFAULT_CACHE_DIR,
  TRACKERS,
} from "./constants";
import { download } from "./helpers";
import ip from "ip";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import got from "got";
import settings from "./settings";

export const opensubtitles = new OpenSubtitles({
  apikey: OPENSUBTITLES_API_KEY,
});

export default () => {
  // TORRENT
  ipcMain.handle("torrent-init", (event) => torrent.init(event));

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
  });

  ipcMain.handle("torrent-destroy", (event, infoHash, ...args) => {
    torrent.destroy(event, infoHash, ...args);
  });

  // FS
  ipcMain.handle("fs-read-file", (_, path) => {
    return fs.readFileSync(path);
  });

  ipcMain.handle("fs-download", (_, url, path) => {
    return download(url, path);
  });

  // External players
  ipcMain.handle("external-players-discover", () => {
    return externalPlayers.discover();
  });

  ipcMain.handle("external-players-list", () => {
    return externalPlayers.list;
  });

  ipcMain.handle("external-players-play", (_, playerId, params) => {
    externalPlayers.play(playerId, params);
  });

  ipcMain.handle("external-players-stop", (_, playerId) => {
    externalPlayers.stop(playerId);
  });

  ipcMain.handle("external-players-pause", (_, playerId) => {
    externalPlayers.pause(playerId);
  });

  ipcMain.handle("external-players-resume", (_, playerId) => {
    externalPlayers.resume(playerId);
  });

  ipcMain.handle("external-players-status", (_, playerId) => {
    return externalPlayers.status(playerId);
  });

  // SHELL
  ipcMain.handle("shell-open-external", (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle("shell-open-path", (_event, path) => {
    shell.openPath(path);
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

  // WEBPAGE
  ipcMain.handle("webpage-parse", async (_event, url) => {
    try {
      const html = await got(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0",
        },
      }).text();
      const doc = new JSDOM(html, { url });
      const reader = new Readability(doc.window.document);
      return reader.parse();
    } catch (err) {
      log.error(err);
      return {};
    }
  });

  // SETTINGS
  ipcMain.handle("settings-all", () => {
    return settings.getSync();
  });

  ipcMain.handle("settings-get", (_event, key) => {
    return settings.getSync(key);
  });

  ipcMain.handle("settings-set", (_event, key, value) => {
    settings.set(key, value);
  });

  ipcMain.handle("settings-reset", () => {
    (settings as any).resetToDefaults();
  });

  // CLIENT
  ipcMain.handle("client-ip", () => {
    return ip.address();
  });
};
