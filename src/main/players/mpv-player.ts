import GenericPlayer from "./generic-player";
import log from "electron-log";
import NodeMPV from "node-mpv";
import ip from "ip";

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
    const { url, options = {}, subtitles = [] } = params;

    try {
      if (!this.mpv.isRunning()) {
        await this.mpv.start();
      }

      const args = [];
      if (options.startTime) {
        args.push(`--start=${options.startTime}`);
      }
      if (subtitles.length > 0) {
        const subFile = subtitles[0].url.replace("localhost", ip.address());
        args.push(`--sub-file=${subFile}`);
      }
      log.info("MPV", "load", url, args);
      await this.mpv.load(url, "replace", ...args);

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
      const isPaused = await this.mpv.isPaused();
      try {
        const duration = await this.mpv.getDuration();
        const timePosition = await this.mpv.getTimePosition();

        return {
          playerState: isPaused ? "PAUSED" : "PLAYING",
          duration,
          currentTime: timePosition,
        };
      } catch (err) {
        log.error(err);
        return {
          playerState: isPaused ? "PAUSED" : "PLAYING",
        };
      }
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
