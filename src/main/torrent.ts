import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { torrent } from "rum-torrent";
import log from "electron-log";
import Store from "electron-store";

// https://github.com/webtorrent/create-torrent/blob/master/index.js#L16
const announceList = [
  ["udp://tracker.leechers-paradise.org:6969"],
  ["udp://tracker.coppersurfer.tk:6969"],
  ["udp://tracker.opentrackr.org:1337"],
  ["udp://explodie.org:6969"],
  ["udp://tracker.empire-js.us:1337"],
  ["wss://tracker.btorrent.xyz"],
  ["wss://tracker.openwebtorrent.com"],
];

const store = new Store();

export class Torrent {
  public client: any;

  constructor() {}

  async startTorrent(event: IpcMainInvokeEvent, meta: Meta, ..._args: any[]) {
    log.debug("start-torrent", meta);
    store.set('playing', meta);

    await torrent.init({
      callback: (state: any) => {
        log.debug(state);
        event.sender.send("torrent-state-updated", state, meta);
      },
    });
    this.client = await torrent.getClient();

    this.client.on("error", (error: ErrorEvent) => {
      log.error(error);
    });

    // load local player
    const win = BrowserWindow.fromWebContents(event.sender);
    log.debug(win.webContents.getURL());

    await win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    win.webContents.send("torrent-started", meta);

    const parsedTorrent = await torrent.parseTorrent(meta.infoHash);

    // check if torrent already added
    const duplicateTorrent = this.client.torrents.find((t: any) => {
      t.infoHash === meta.infoHash;
    });

    if (duplicateTorrent) {
      log.warn(`Torrent already added: ${meta.infoHash}`);
      log.warn(`Torrent progress: ${duplicateTorrent.progress}`);
      return;
    }

    // clear previous torrents
    this.clearTorrents();

    log.warn(`current torrents ${this.client.torrents.length}`);
    torrent.seed(torrent.toMagnetURI(parsedTorrent), {
      announce: announceList,
    });
  }

  clearTorrents() {
    this.client.torrents.forEach(async (torrent: any) => {
      await torrent.destroy();
    });
  }

  stopTorrent(_event: IpcMainInvokeEvent, infoHash: string, ..._args: any[]) {
    log.debug("stop-torrent", infoHash);

    const t = this.client.torrents.find((torrent: any) => {
      torrent.infoHash === infoHash;
    });
    t?.destroy();
  }
}
