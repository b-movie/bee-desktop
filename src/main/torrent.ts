import { IpcMainInvokeEvent } from "electron";
import { TRACKERS, CACHE_DIR } from "./constants";
import { generatePortNumber } from "./helpers";
import WebTorrent from "webtorrent";
import log from "electron-log";

export default class Torrent {
  public client: any;
  public server: any;
  private timer: NodeJS.Timer | null = null;

  async init(event: IpcMainInvokeEvent) {
    if (!this.client) {
      this.client = new WebTorrent();
      this.server = this.client.createServer({
        pathname: "/bee",
      });

      this.client.on("error", (error: ErrorEvent) => {
        log.error(error);
        event.sender.send("torrent-on-error", error);
      });

      await this.server.listen(generatePortNumber());
      this.server.server.on("clientError", (error: NodeJS.ErrnoException) => {
        log.error(error);
        if (error.code === "ERR_HTTP_REQUEST_TIMEOUT") return;
      });
    }

    return this.client ? true : false;
  }

  async seed(event: IpcMainInvokeEvent, meta: Meta, ..._args: any[]) {
    await this.init(event);

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

      this.selectFile(meta.infoHash, meta.fileIdx);
    } else {
      log.debug(`Torrent adding: ${meta.infoHash}`);
      this.client.add(
        meta.infoHash,
        {
          path: CACHE_DIR,
          announce: TRACKERS,
          maxConns: 10,
          dht: { concurrency: 16 },
        },
        (torrent: any) => {
          log.debug(`Torrent added: ${meta.infoHash}: ${torrent.name}`);
          this.selectFile(meta.infoHash, meta.fileIdx);
        }
      );
    }

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
      (t: any) => t.infoHash === infoHash.toLowerCase()
    );
    if (!torrent) return;

    torrent.pause();
    torrent.files.forEach((file: any) => file.deselect());
    torrent.deselect(0, torrent.pieces.length - 1, false);
  }

  resume(infoHash: string) {
    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash.toLowerCase()
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
      (t: any) => t.infoHash === infoHash.toLowerCase()
    );
    if (!torrent) return;

    torrent.deselect(0, torrent.pieces.length - 1, false); // Remove default selection (whole torrent)
  }

  deselectFile(infoHash: string, fileIdx: number) {
    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash.toLowerCase()
    );
    if (!torrent) return;

    torrent.files[fileIdx].deselect();
  }

  selectFile(infoHash: string, fileIdx: number) {
    if (!this.client) return;

    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash.toLowerCase()
    );
    if (!torrent) return;

    log.debug("select stream file only");
    // deselect files, webtorrent api
    // as of november 2016, need to remove all torrent,
    //  then add wanted file, it's a bug: https://github.com/feross/webtorrent/issues/164
    // Deselect all files on initial download
    torrent.deselect(0, torrent.pieces.length - 1, false);

    // Select file with provided index
    for (let i = 0; i < torrent.files.length; i++) {
      const file = torrent.files[i];
      if (i == fileIdx) {
        file.select();
        log.debug("selecting file " + i + " of torrent: " + file.name);
      } else {
        log.debug("deselecting file " + i + " of torrent: " + file.name);
        file.deselect();
      }
    }
  }

  destroy(_event: IpcMainInvokeEvent, infoHash: string, ..._args: any[]) {
    log.debug("destroy-torrent", infoHash);

    const torrent = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash.toLowerCase()
    );
    torrent?.destroy();
  }

  torrentState(torrent: any) {
    return {
      name: torrent?.name,
      infoHash: torrent?.infoHash,
      magnetURI: torrent?.magnetURI,
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
          `http://localhost:${this.server.server.address().port}` + f.streamURL,
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
      (t: any) => t.infoHash === infoHash.toLowerCase()
    );
    return torrent?.torrentFile;
  }

  state(infoHash: string) {
    const torrent: any = this.client.torrents.find(
      (t: any) => t.infoHash === infoHash.toLowerCase()
    );

    return this.torrentState(torrent);
  }

  summary() {
    if (!this.client) return [];

    return this.client.torrents.map((t: any) => this.torrentState(t));
  }
}
