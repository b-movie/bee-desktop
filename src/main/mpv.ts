import NodeMPV from "node-mpv";
import log from "electron-log";
import os from "os";
import { chmodSync, existsSync } from "fs";
import path from "path";

export class MPV {
  public mpv: any;

  init(options: object = {}, args: string[] = []) {
    const platform = os.platform();
    const binary =
      platform === "win32"
        ? path.join(__dirname, "libs/mpv/mpv.exe")
        : path.join(__dirname, "libs/mpv/mpv");
    if (existsSync(binary)) {
      log.info("MPV", "chmod 755", binary);
      chmodSync(binary, 0o755);
      options = { ...options, binary };
    }

    const defaultArgs = ["--fullscreen", "--config-dir=libs/mpv/config"];
    args = [...defaultArgs, ...args];

    this.mpv = new NodeMPV(options, args);
    this.mpv.on("status", (status: any) => {
      log.info("MPV", status);
    });
    this.mpv.on("quit", () => {
      log.warn("MPV", "quit by user");
      this.mpv = null;
    });
  }

  async load(url: string) {
    if (!this.mpv) {
      this.init();
    }

    try {
      await this.mpv.start();
      await this.mpv.load(url);
    } catch (err) {
      log.error(err);
    }
  }

  async quit() {
    await this.mpv?.quit();
  }

  isRunning() {
    return this.mpv?.isRunning();
  }
}
