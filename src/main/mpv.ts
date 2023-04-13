import { BrowserWindow, IpcMainInvokeEvent } from "electron";
import NodeMPV from "node-mpv";
import log from "electron-log";
import os from "os";
import { chmodSync, existsSync } from "fs";
import path from "path";

export class MPV {
  public mpv: any;

  init(event: IpcMainInvokeEvent, options: object = {}, args: string[] = []) {
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

    const defaultArgs = ["--fullscreen", `--config-dir=${configDir}`];
    args = [...defaultArgs, ...args];

    this.mpv = new NodeMPV(options, args);

    this.mpv.on("status", (status: any) => {
      log.info("MPV", status);
      event.sender.send("mpv-state-updated", status);
      // if (status.property == "fullscreen") {
      //   win.setFullScreen(status.value);
      // }
    });

    this.mpv.on("quit", () => {
      log.warn("MPV", "quit by user");
      this.mpv = null;
      win.setFullScreen(false);
    });
  }

  async load(event: IpcMainInvokeEvent, url: string) {
    if (!this.mpv) {
      this.init(event);
    }

    try {
      await this.mpv.start();
      await this.mpv.load(url);
    } catch (err) {
      log.error(err);
      event.sender.send("mpv-error", err);
    }
  }

  async quit() {
    await this.mpv?.quit();
    this.mpv = null;
  }

  isRunning() {
    return this.mpv?.isRunning();
  }
}
