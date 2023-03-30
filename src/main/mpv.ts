import NodeMPV from "node-mpv";
import log from "electron-log";

export class MPV {
  public mpv: any;

  init(options: object = {}, args: string[] = []) {
    const defaultArgs = ["--fullscreen", "--config-dir=libs/mpv/config"];
    args = [...defaultArgs, ...args];

    this.mpv = new NodeMPV(options, args);
    this.mpv.on("status", (status: any) => {
      log.info("MPV", status);
    });
    this.mpv.on("quit", () => {
      log.warn("MPV", "quit by user");
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
