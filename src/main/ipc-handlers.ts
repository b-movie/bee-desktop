globalThis.crypto = require("crypto");
import "dotenv/config";
import { ipcMain, shell } from "electron";
import Torrent from "./torrent";
import MPV from "./mpv";
import Store from "electron-store";
import log from "electron-log";
import fs from "fs";
import OpenSubtitles from "opensubtitles.com";
import { OPENSUBTITLES_API_KEY, SUBTITLE_CACHE_DIR } from "./constants";
import { download } from "./helpers";
import SubtitlesServer from "./subtitles-server";
import ChromecastAPI from "chromecast-api";
import path from "path";

const dlnacasts = require("dlnacasts2")();
const chromecast = new ChromecastAPI();
const mpv = new MPV();
const torrent = new Torrent();
const store = new Store();
const opensubtitles = new OpenSubtitles({
  apikey: OPENSUBTITLES_API_KEY,
});
const subtitlesServer = new SubtitlesServer();

const ipcHandlers = () => {
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

  ipcMain.handle("fs-read-file", (_, path) => {
    return fs.readFileSync(path);
  });

  ipcMain.handle("fs-download", (_, url, path) => {
    return download(url, path);
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

  ipcMain.handle("subtitles-server-serve", (_event, path) => {
    log.debug("subtitles-server-serve", path);
    return subtitlesServer.serve(path);
  });

  ipcMain.handle("subtitles-server-download", async (_event, url, fileName) => {
    log.debug("subtitles-server-download", url);
    const dest = path.join(SUBTITLE_CACHE_DIR, fileName);
    await download(url, dest);
    return subtitlesServer.serve(dest);
  });
};

export default ipcHandlers;
