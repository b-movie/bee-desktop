import ip from "ip";
import log from "electron-log";

export class GenericDevice {
  public interval: any = null;
  public status: any = {};

  clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Chromecast
export class ChromecastDevice extends GenericDevice {
  constructor(public device: any) {
    super();

    if (!device) throw new Error("Device not found");
    this.device = device;
  }

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

    this.clearInterval();
    this.interval = setInterval(() => {
      log.debug("chromecast player", this.device?.player?.senderId);
      if (!this.device?.player) return;

      try {
        this.device.getStatus((err: any, status: any) => {
          if (err) return;

          this.status = status;
        });
      } catch (err) {
        log.error("chromecast getStatus error:", err);
      }
    }, 1000);
  }

  pause() {
    this.device.pause();
  }

  resume() {
    this.device.resume();
  }

  stop() {
    this.clearInterval();

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
  constructor(public device: any) {
    super();

    if (!device) throw new Error("Device not found");
    this.device = device;
  }

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

    this.clearInterval();
    this.device.on("status", (status: any) => {
      log.debug("dlna player on status:", status);
      this.status = status;
    });

    this.interval = setInterval(() => {
      this.device.status((err: any, status: any) => {
        if (err) return;
        log.debug("dlna player fetch status:", status);
        this.status = status;
      });
    }, 1000);
  }

  pause() {
    this.device.pause();
  }

  resume() {
    this.device.resume();
  }

  stop() {
    this.device.stop();
    this.clearInterval();
    this.status = {};
  }
}
