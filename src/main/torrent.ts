import { IpcMainInvokeEvent } from "electron";
import { TRACKERS, CACHE_DIR } from "./constants";
import { generatePortNumber } from "./helpers";
import WebTorrent from "webtorrent";
import log from "electron-log";
import ip from "ip";

export default class Torrent {
  public client: any;
  public server: any;
  private timer: NodeJS.Timer | null = null;

  async init() {
    if (!this.client) {
      this.client = new WebTorrent();
      this.server = this.client.createServer({
        pathname: "/bee",
      });
      this.server.listen(generatePortNumber());
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
      existedTorrent.files[meta.fileIdx]?.select(); // Select only fileIdx
    } else {
      this.client.add(
        meta.infoHash,
        {
          path: CACHE_DIR,
          announce: TRACKERS,
        },
        (torrent: any) => {
          log.debug("select stream file only");
          // deselect files, webtorrent api
          // as of november 2016, need to remove all torrent,
          //  then add wanted file, it's a bug: https://github.com/feross/webtorrent/issues/164
          torrent.deselect(0, torrent.pieces.length - 1, false); // Remove default selection (whole torrent)
          torrent.files[meta.fileIdx]?.select(); // Select only fileIdx
        }
      );
    }

    this.client.on("error", (error: ErrorEvent) => {
      log.error(error);
      event.sender.send("torrent-on-error", error);
    });

    // clear previous timer
    if (this.timer) clearInterval(this.timer);

    // send torrent state every 1.5s
    this.timer = setInterval(() => {
      // avoid js error when window is closed
      if (!event.sender || event.sender.isDestroyed()) return;

      event.sender.send("torrent-on-state", this.state(meta.infoHash));
    }, 1500);
  }

  pause(infoHash: string) {
    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    if (!torrent) return;

    torrent.pause();
  }

  resume(infoHash: string) {
    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    if (!torrent) return;

    torrent.resume();
  }

  destroyAll() {
    if (!this.client) return;

    this.client.torrents.forEach((torrent: any) => {
      torrent.destroy();
    });
  }

  deselectAll(infoHash: string) {
    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    if (!torrent) return;

    torrent.deselect(0, torrent.pieces.length - 1, false); // Remove default selection (whole torrent)
  }

  deselectFile(infoHash: string, fileIdx: number) {
    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    if (!torrent) return;

    torrent.files[fileIdx].deselect();
  }

  selectFile(infoHash: string, fileIdx: number) {
    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash
    );
    if (!torrent) return;

    torrent.files[fileIdx]?.select();
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
        streamUrl:
          `http://localhost:${
            this.server.server.address().port
          }` + f.streamURL,
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
