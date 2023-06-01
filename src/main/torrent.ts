import { IpcMainInvokeEvent } from "electron";
import { torrent as RumTorrent } from "rum-torrent";
import log from "electron-log";
import ip from "ip";

// https://github.com/webtorrent/create-torrent/blob/master/index.js#L16
const announceList = [
  ["udp://tracker.leechers-paradise.org:6969"],
  ["udp://tracker.coppersurfer.tk:6969"],
  ["udp://tracker.empire-js.us:1337"],
  ["udp://tracker.opentrackr.org:1337"],
  ["udp://opentracker.i2p.rocks:6969"],
  ["https://opentracker.i2p.rocks:443"],
  ["http://tracker.openbittorrent.com:80"],
  ["udp://tracker.openbittorrent.com:6969"],
  ["udp://open.demonii.com:1337"],
  ["udp://open.stealth.si:80"],
  ["udp://exodus.desync.com:6969"],
  ["udp://tracker.torrent.eu.org:451"],
  ["udp://tracker.moeking.me:6969"],
  ["udp://tracker.bitsearch.to:1337"],
  ["udp://p4p.arenabg.com:1337"],
  ["udp://explodie.org:6969"],
  ["udp://tracker1.bt.moack.co.kr:80"],
  ["udp://tracker.theoks.net:6969"],
  ["udp://tracker.altrosky.nl:6969"],
  ["udp://movies.zsw.ca:6969"],
  ["https://tracker.tamersunion.org:443"],
  ["https://tracker.moeblog.cn:443"],
  ["https://tr.burnabyhighstar.com:443"],
  ["wss://tracker.btorrent.xyz"],
  ["wss://tracker.openwebtorrent.com"],
];

// fix windows path
const toUnixPath = (path: string) =>
  path.replace(/[\\/]+/g, "/").replace(/^([a-zA-Z]+:|\.\/)/, "");

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
    }

    return this.client ? true : false;
  }

  async seed(event: IpcMainInvokeEvent, meta: Meta, ..._args: any[]) {
    await this.init();

    let existedTorrent: any = null;
    this.client.torrents.forEach((t: any) => {
      if (t.infoHash === meta.infoHash) {
        existedTorrent = t;
      }
    });

    if (existedTorrent) {
      log.warn(`Torrent already added: ${meta.infoHash}`);
      log.warn(
        `Torrent progress: ${(existedTorrent.progress * 100).toFixed(2)}%`
      );
      if (existedTorrent.paused) existedTorrent.resume();
    } else {
      const parsedTorrent = await RumTorrent.parseTorrent(meta.infoHash);
      await RumTorrent.seed(RumTorrent.toMagnetURI(parsedTorrent), {
        announce: announceList,
      });
    }

    this.client.on("torrent", (torrent: any) => {
      log.debug(`torrent ${torrent.infoHash} ready`);
      log.debug(`priority file ${torrent.files[meta.fileIdx]?.name}`);
      torrent.files[meta.fileIdx]?.select(1);
    });

    this.client.on("error", (error: ErrorEvent) => {
      log.error(error);
      event.sender.send("torrent-error", error);
    });

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

  setPriority(infoHash: string, fileIndex: number, priority: number) {
    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    if (!torrent) return;

    torrent.files[fileIndex].select(priority);
  }

  destroy(_event: IpcMainInvokeEvent, infoHash: string, ..._args: any[]) {
    log.debug("destroy-torrent", infoHash);

    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    torrent?.destroy();
  }

  torrentState(torrent: any) {
    return {
      name: torrent?.name,
      infoHash: torrent?.infoHash,
      magnetURI: torrent?.progress,
      // torrentFile: torrent?.torrentFile,
      announce: torrent?.announce,
      files: torrent?.files?.map((f: any) => ({
        name: f.name,
        path: f.path,
        length: f.length,
        downloaded: f.downloaded,
        progress: f.progress,
        priority: f.priority,
        streamUrl: `http://${ip.address() || "localhost"}:${
          this.client._server.server.address().port
        }/rum-pt/${torrent.infoHash}/${toUnixPath(f.path)}`,
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

  torrentFile(infoHash: string) {
    const torrent: any = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    return torrent?.torrentFile;
  }

  state(infoHash: string) {
    const torrent: any = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );

    return this.torrentState(torrent);
  }

  summary() {
    if (!this.client) return [];

    return this.client.torrents.map((t: any) => this.torrentState(t));
  }
}
