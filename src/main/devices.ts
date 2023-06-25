import log from "electron-log";

export class GenericDevice {
  public interval: any = null;
  public status: any = {};

  constructor(public device: any) {
    if (!device) throw new Error("Device not found");
    this.device = device;
  }

  clearDeviceInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Chromecast
export class ChromecastDevice extends GenericDevice {
  play(media: CastMedia) {
    const { url, title, cover, subtitles, options } = media;

    this.device.play(
      {
        url,
        title,
        cover,
        subtitles: subtitles?.length > 0 ? subtitles : null,
      },
      options
    );

    this.clearDeviceInterval();
    this.interval = setInterval(() => {
      if (!this.device?.player) return;

      try {
        this.device.getStatus((err: any, status: any) => {
          if (err) return;

          this.status = status;
          log.debug(
            "chromecast player fetch status:",
            status?.playerState,
            status?.currentTime
          );
        });
      } catch (err) {
        log.error("chromecast getStatus error:", err);
      }
    }, 1000);
  }

  pause() {
    try {
      this.device.pause();
    } catch (err) {
      log.error("chromecast pause error:", err);
    }
  }

  resume() {
    try {
      this.device.resume();
    } catch (err) {
      log.error("chromecast resume error:", err);
    }
  }

  stop() {
    this.clearDeviceInterval();

    try {
      this.device.close();
      this.status = {};
    } catch (err) {
      log.error("chromecast stop error:", err);
    }
  }
}

// DLNA
export class DlnaDevice extends GenericDevice {
  play(media: CastMedia) {
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
    this.device.play(media.url, options);

    this.clearDeviceInterval();
    this.interval = setInterval(() => {
      this.device.status((err: any, status: any) => {
        if (err) return;
        log.debug("dlna player fetch status:", status);
        this.status = status;
      });
    }, 1000);
  }

  pause() {
    try {
      this.device.pause();
    } catch (err) {
      log.error("dlna pause error:", err);
    }
  }

  resume() {
    try {
      this.device.resume();
    } catch (err) {
      log.error("dlna resume error:", err);
    }
  }

  stop() {
    this.clearDeviceInterval();
    try {
      this.device.stop();
      this.status = {};
    } catch (err) {
      log.error("dlna stop error:", err);
    }
  }
}
