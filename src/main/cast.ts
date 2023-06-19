import ChromecastAPI from "chromecast-api";
import log from "electron-log";
import { AirplayDevice, ChromecastDevice, DlnaDevice } from "./devices";

export default class Cast {
  public chromecast: any;
  public dlnacast: any;
  public airplay: any;
  public devices: any[] = [];
  public device: any = null;

  init() {
    this.chromecast = new ChromecastAPI();
    this.dlnacast = require("dlnacasts2")();
    this.airplay = require("airplayer")();
  }

  update() {
    const _devices: any[] = [];

    this.chromecast.update();
    this.chromecast.devices.forEach((device: any) => {
      _devices.push({
        protocol: "chromecast",
        name: device.name,
        friendlyName: device.friendlyName || device.name,
        host: device.host,
      });
    });

    this.dlnacast.update();
    this.dlnacast.players.forEach((device: any) => {
      _devices.push({
        protocol: "dlna",
        name: device.name,
        friendlyName: device.friendlyName || device.name,
        host: device.host,
      });
    });

    this.airplay.update();
    this.airplay.players.forEach((device: any) => {
      _devices.push({
        protocol: "airplay",
        name: device.name,
        friendlyName: device.name || device.serverInfo.model,
        host: device.host,
      });
    });

    this.devices = _devices;
    return this.devices;
  }

  availableDevices() {
    return this.devices;
  }

  async play(host: string, media: CastMedia) {
    log.debug("cast-play:", host, media);

    await this.device?.stop();

    const device = this.devices.find((device) => device.host === host);
    if (!device) throw new Error("Device not found");

    if (device.protocol === "chromecast") {
      const player = this.chromecast.devices.find((d: any) => d.host === host);
      this.device = new ChromecastDevice(player);
    } else if (device.protocol === "dlna") {
      const player = this.dlnacast.players.find((d: any) => d.host === host);
      this.device = new DlnaDevice(player);
    } else if (device.protocol === "airplay") {
      const player = this.airplay.players.find((d: any) => d.host === host);
      this.device = new AirplayDevice(player);
    }
    if (!this.device) throw new Error("Device not found");

    try {
      this.device.play(media);
    } catch (err) {
      log.error("cast-play error:", err);
    }
  }

  pause() {
    log.debug("cast-pause", this.device?.device?.host);
    this.device?.pause();
  }

  resume() {
    log.debug("cast-resume", this.device?.device?.host);
    this.device?.resume();
  }

  async stop() {
    log.debug("cast-stop", this.device?.device?.host);
    await this.device?.stop();
    this.device = null;
  }

  currentStatus() {
    return this.device?.status;
  }
}
