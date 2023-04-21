import { IpcMainInvokeEvent } from "electron";
import { torrent as RumTorrent } from "rum-torrent";
import log from "electron-log";

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

export class Torrent {
  public client: any;
  private timer: NodeJS.Timer | null = null;

  async init() {
    if (!this.client) {
      await RumTorrent.init({
        callback: (state: any) => {
          // log.debug(state);
        },
      });
      this.client = await RumTorrent.getClient();
      this.client.on("error", (error: ErrorEvent) => {
        log.error(error);
      });
    }

    return this.client ? true : false;
  }

  async seed(event: IpcMainInvokeEvent, meta: Meta, ..._args: any[]) {
    await this.init();

    let existedTorrent: any = null;
    this.client.torrents.forEach((t: any) => {
      if (t.infoHash === meta.infoHash) {
        existedTorrent = t;
      } else {
        t.destroy();
      }
    });

    if (existedTorrent) {
      log.warn(`Torrent already added: ${meta.infoHash}`);
      log.warn(`Torrent progress: ${existedTorrent.progress}`);
      if (existedTorrent.paused) existedTorrent.resume();
    } else {
      const parsedTorrent = await RumTorrent.parseTorrent(meta.infoHash);
      await RumTorrent.seed(RumTorrent.toMagnetURI(parsedTorrent), {
        announce: announceList,
      });
    }

    // clear previous timer
    if (this.timer) clearInterval(this.timer);

    // send torrent state every 1.5s
    this.timer = setInterval(() => {
      // avoid js error when window is closed
      if (!event.sender || event.sender.isDestroyed()) return;

      event.sender.send("torrent-state-updated", this.state(meta.infoHash));
    }, 1500);
  }

  destroyAll() {
    if (!this.client) return;

    this.client.torrents.forEach((torrent: any) => {
      torrent.destroy();
    });
  }

  destroy(_event: IpcMainInvokeEvent, infoHash: string, ..._args: any[]) {
    log.debug("destroy-torrent", infoHash);

    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    torrent?.destroy();
  }

  state(infoHash: string) {
    const torrent: any = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );

    return {
      name: torrent?.name,
      infoHash: torrent?.infoHash,
      magnetURI: torrent?.progress,
      torrentFile: torrent?.torrentFile,
      announce: torrent?.announce,
      files: torrent?.files?.map((f: any) => ({
        name: f.name,
        path: f.path,
        length: f.length,
        downloaded: f.downloaded,
        progress: f.progress,
        streamUrl: `http://localhost:${
          this.client._server.server.address().port
        }/rum-pt/${infoHash}/${f.path}`,
      })),
      timeRemaining: torrent?.timeRemaining,
      received: torrent?.received,
      downloaded: torrent?.downloaded,
      uploaded: torrent?.uploaded,
      downloadSpeed: torrent?.downloadSpeed,
      uploadSpeed: torrent?.uploadSpeed,
      progress: torrent?.progress,
      ratio: torrent?.ratio,
      numPeers: torrent?.numPeers,
      path: torrent?.path,
      ready: torrent?.ready,
      paused: torrent?.paused,
      done: torrent?.done,
      length: torrent?.length,
      created: torrent?.created,
      createdBy: torrent?.createdBy,
      comment: torrent?.comment,
    };
  }
}
