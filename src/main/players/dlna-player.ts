import GenericPlayer from "./generic-player";
import log from "electron-log";
import ip from "ip";

export default class DlnaPlayer extends GenericPlayer {
  private device: any;
  public _status: any;

  constructor(config: PlayerConfig, device: any) {
    super(config);
    this.device = device;
  }

  play(media: MediaParams) {
    if (media.subtitles && media.subtitles?.length > 0) {
      media.subtitles = this.serveSubtitles(media.subtitles);
    }

    const options = {
      title: media.title,
      seek: media.options?.startTime,
      subtitles:
        media.subtitles && media.subtitles.length > 0
          ? media.subtitles.map((sub: any) => sub.url)
          : null,
      autoSubtitles: true,
    };
    log.debug("dlna play:", media.url, options);
    this.device.play(
      media.url.replace("localhost", ip.address()),
      options,
      (err: any) => {
        if (err) {
          log.error("dlna play error:", err);
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
    this.device.stop();
  }

  status() {
    this._getStatus();
    return this._status;
  }

  _getStatus() {
    this.device.status((err: any, status: any) => {
      if (err) return;
      log.debug("dlna player fetch status:", status);
      this._status = {
        playerState: status?.playerState,
        currentTime: status?.currentTime,
        duration: status?.media?.duration,
      };
    });
  }
}
