import GenericPlayer from "./generic-player";
import log from "electron-log";
import ip from "ip";

export default class ChromecastPlayer extends GenericPlayer {
  private device: any;
  public _status: any = {};

  constructor(config: PlayerConfig, device: any) {
    super(config);
    this.device = device;
  }

  play(media: MediaParams): void {
    if (media.subtitles && media.subtitles?.length > 0) {
      media.subtitles = this.serveSubtitles(media.subtitles);
    }

    const { url, cover, subtitles, options } = media;
    this.device.play(
      {
        url: url.replace("localhost", ip.address()),
        cover,
        subtitles: subtitles?.length > 0 ? subtitles : null,
      },
      options,
      (err: any) => {
        if (err) {
          log.error("Chromecast play error:", err);
        } else {
          this._getStatus();
        }
      }
    );
  }

  pause() {
    this.device.pause();
  }

  resume() {
    this.device.resume();
  }

  stop() {
    this.device.close();
    this._status = {};
  }

  status() {
    this._getStatus();

    return this._status;
  }

  _getStatus() {
    if (!this.device.player) return;

    this.device.getStatus((err: any, status: any) => {
      if (err) return;

      this._status = {
        playerState: status?.playerState,
        currentTime: status?.currentTime,
        duration: status?.media?.duration,
      };
      log.debug(
        "chromecast player fetch status:",
        status?.playerState,
        status?.currentTime
      );
    });
  }
}
