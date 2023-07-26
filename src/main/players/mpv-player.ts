import { IpcMainInvokeEvent } from "electron";
import NodeMPV from "node-mpv";
import log from "electron-log";
import os from "os";
import path from "path";
import GenericPlayer from "./generic-player";

export default class MPV extends GenericPlayer {
  public mpv: any;

  constructor(config: PlayerConfig) {
    super(config);
  }

  init(event: IpcMainInvokeEvent, options: any = {}, args: string[] = []) {
    if (this.mpv) return this.mpv;

    const platform = os.platform();
    const subFilePaths = ["subs", "Subs", "subtitles"];
    const defaultArgs: string[] = [
      "--sub-auto=all",
      `--sub-file-paths=${
        platform === "win32" ? subFilePaths.join(";") : subFilePaths.join(":")
      }`,
      "--save-position-on-quit",
    ];

    // If the user has specified a path to mpv, use that
    let { binary } = options;

    // If binary is not specified, use the bundled mpv
    if (!binary) {
      binary =
        platform === "win32"
          ? path.join(__dirname, "libs/mpv/mpv.exe")
          : path.join(__dirname, "libs/mpv/mpv");
      defaultArgs.push(
        `--config-dir=${path.join(__dirname, "libs/mpv/config")}`
      );
    }

    options = { ...options, binary: binary };
    args = [...defaultArgs, ...args];

    this.mpv = new NodeMPV(options, args);
    log.info("MPV init", options, args);

    this.mpv.on("status", (status: any) => {
      log.info("MPV", status);
      event.sender.send("mpv-on-status", status);
    });

    this.mpv.on("started", async () => {
      this.mpv.observeProperty("sid");
      event.sender.send("mpv-on-status", {
        property: "event:started",
        value: true,
      });
    });

    this.mpv.on("stopped", async () => {
      event.sender.send("mpv-on-status", {
        property: "event:stopped",
        value: true,
      });
    });

    this.mpv.on("seek", async (position: { start: number; end: number }) => {
      event.sender.send("mpv-on-seek", position);
      event.sender.send("mpv-on-status", {
        property: "event:seek",
        value: position,
      });
    });

    this.mpv.on("timeposition", async (timePosition: number) => {
      event.sender.send("mpv-on-status", {
        property: "time-pos",
        value: timePosition,
      });
    });

    this.mpv.on("quit", () => {
      log.warn("MPV", "quit by user");
      this.mpv = null;
      event.sender.send("mpv-on-status", {
        property: "event:stopped",
        value: true,
      });
    });
  }

  async load(event: IpcMainInvokeEvent, url: string, options: any = {}) {
    if (!this.mpv) {
      this.init(event, options);
    }

    try {
      await this.mpv.start();
      log.info("MPV", "load", url);
      await this.mpv.load(url, "replace");
      if (options.start) {
        this.mpv.goToPosition(options.start);
      }
    } catch (err) {
      log.error(err);
      event.sender.send("mpv-on-status", {
        property: "event:error",
        value: err,
      });
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
