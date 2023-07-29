import GenericPlayer from "./generic-player";
import log from "electron-log";
import NodeMPV from "node-mpv";

export default class MPV extends GenericPlayer {
  public mpv: any;

  constructor(config: PlayerConfig) {
    super(config);
    this.init();
  }

  init() {
    if (this.mpv) return this.mpv;

    const options = { binary: this.config.path };
    const args = this.config.switches.split(" ");
    this.mpv = new NodeMPV(options, args);
    log.info("MPV init", options, args);
  }

  async play(params: MediaParams) {
    if (!this.mpv) this.init();

    log.info("MPV", "play", params);
    const { url, options = {} } = params;

    try {
      if (!this.mpv.isRunning()) {
        await this.mpv.start();
      }

      log.info("MPV", "load", url);
      await this.mpv.load(url, "replace");

      if (options.startTime) {
        await this.mpv.goToPosition(options.startTime);
      }
    } catch (err) {
      log.error(err);
    }
  }

  pause() {
    this.mpv?.pause();
  }

  resume() {
    this.mpv?.resume();
  }

  stop() {
    if (!this.isRunning()) return;

    this.mpv.quit().catch((err: any) => {
      log.error(err);
    });
  }

  async status() {
    if (!this.isRunning()) {
      return {
        playerState: "STOPPED",
      };
    } else {
      const duration = await this.mpv.getDuration();
      const timePosition = await this.mpv.getTimePosition();
      const isPaused = await this.mpv.isPaused();

      return {
        playerState: isPaused ? "PAUSED" : "PLAYING",
        duration,
        currentTime: timePosition,
      };
    }
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
