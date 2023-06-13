import { BrowserWindow, IpcMainInvokeEvent } from "electron";
import NodeMPV from "node-mpv";
import log from "electron-log";
import os from "os";
import { existsSync } from "fs";
import path from "path";

export default class MPV {
  public mpv: any;

  init(event: IpcMainInvokeEvent, options: object = {}, args: string[] = []) {
    const platform = os.platform();
    const binary =
      platform === "win32"
        ? path.join(__dirname, "libs/mpv/mpv.exe")
        : path.join(__dirname, "libs/mpv/mpv");
    if (existsSync(binary)) {
      options = { ...options, binary };
    }
    const configDir = path.join(__dirname, "libs/mpv/config");

    const win = BrowserWindow.fromWebContents(event.sender);
    // let winID: number;
    // let hbuf = win.getNativeWindowHandle();
    //
    // if (os.endianness() == "LE") {
    //   winID = hbuf.readInt32LE();
    // } else {
    //   winID = hbuf.readInt32BE();
    // }

    const defaultArgs = [
      // "--fullscreen",
      `--config-dir=${configDir}`,
      "--save-position-on-quit",
      // "--wid=" + winID,
    ];
    args = [...defaultArgs, ...args];

    this.mpv = new NodeMPV(options, args);

    this.mpv.on("status", (status: any) => {
      log.info("MPV", status);
      event.sender.send("mpv-on-status", status);
    });

    this.mpv.on("started", async () => {
      event.sender.send("mpv-on-started");
    });

    this.mpv.on("paused", async () => {
      event.sender.send("mpv-on-paused");
    });

    this.mpv.on("stopped", async () => {
      event.sender.send("mpv-on-stopped");
    });

    this.mpv.on("seek", async (position: { start: number; end: number }) => {
      event.sender.send("mpv-on-seek", position);
    });

    this.mpv.on("timeposition", async (timePosition: number) => {
      event.sender.send("mpv-on-time-position", timePosition);
    });

    this.mpv.on("quit", () => {
      log.warn("MPV", "quit by user");
      this.mpv = null;
      win.setFullScreen(false);
      event.sender.send("mpv-on-stopped");
    });
  }

  async load(event: IpcMainInvokeEvent, url: string, options: any = {}) {
    if (!this.mpv) {
      this.init(event);
    }

    try {
      await this.mpv.start();
      log.info("MPV", "load", url, options);
      await this.mpv.load(url, "replace");
      if (options.start) {
        this.mpv.goToPosition(options.start);
      }
    } catch (err) {
      log.error(err);
      event.sender.send("mpv-error", err);
    }
  }

  pause() {
   this.mpv?.pause();
  }

  resume() {
   this.mpv?.resume();
  }

  async quit() {
    await this.mpv?.quit();
    this.mpv = null;
  }

  isRunning() {
    return this.mpv?.isRunning();
  }

  addSubtitles(file: string, flag?: string, title?: string, lang?: string) {
    this.mpv?.addSubtitles(file, flag, title, lang);
  }

  observeProperty(property: string) {
    return this.mpv?.observeProperty(property);
  }

  unobserveProperty(property: string) {
    return this.mpv?.unobserveProperty(property);
  }

  getProperty(property: string) {
    return this.mpv?.getProperty(property);
  }

  goToPosition(position: number) {
    if (this.mpv?.isSeekable()) {
      this.mpv.goToPosition(position);
    }
  }

  getTimePosition() {
    return this.mpv?.getTimePosition();
  }

  getPercentPosition() {
    return this.mpv?.getPercentPosition();
  }
}
