import ip from "ip";
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

    subtitles?.forEach((sub: any, index) => {
      subtitles[index].url = sub.url.replace("localhost", ip.address());
    });

    this.device.play(
      {
        url: url.replace("localhost", ip.address()),
        title,
        cover,
        subtitles,
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
            status.playerState,
            status.currentTime
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
          ? media.subtitles.map((sub: any) =>
              sub.url.replace("localhost", ip.address())
            )
          : null,
      autoSubtitles: true,
    };
    log.debug(
      "dlna play:",
      media.url.replace("localhost", ip.address()),
      options
    );
    this.device.play(media.url.replace("localhost", ip.address()), options);

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

// Airplay
export class AirplayDevice extends GenericDevice {
  play(media: CastMedia) {
    log.debug(
      "airplay play:",
      media.url.replace("localhost", ip.address()),
      media.options?.startTime
    );
    this.device.play(
      media.url.replace("localhost", ip.address()),
      media.options?.startTime || 0
    );

    this.clearDeviceInterval();
    this.interval = setInterval(() => {
      this.device.playbackInfo((err: any, _: any, status: any) => {
        if (err) return;
        log.debug("airplay player fetch status:", status);
        this.status = {
          playerState: status.state?.toUpperCase(),
          currentTime: status.position,
        };
      });
    }, 1000);
  }

  pause() {
    try {
      this.device.pause();
    } catch (err) {
      log.error("ariplay pause error:", err);
    }
  }

  resume() {
    try {
      this.device.resume();
    } catch (err) {
      log.error("ariplay resume error:", err);
    }
  }

  stop() {
    this.clearDeviceInterval();
    try {
      this.device.stop();
      this.device.destroy();
      this.status = {};
    } catch (err) {
      log.error("airplay stop error:", err);
    }
  }
}
