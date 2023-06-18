import ChromecastAPI from "chromecast-api";
import log from "electron-log";
import { ChromecastDevice, DlnaDevice } from "./devices";

export default class Cast {
  public chromecast: any;
  public dlnacast: any;
  public devices: any[] = [];
  public device: any = null;

  init() {
    this.chromecast = new ChromecastAPI();
    this.dlnacast = require("dlnacasts2")();
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

    this.devices = _devices;
    return this.devices;
  }

  availableDevices() {
    return this.devices;
  }

  play(host: string, media: CastMedia) {
    log.debug("cast-play:", host, media);

    this.device?.stop();

    const device = this.devices.find((device) => device.host === host);
    if (!device) throw new Error("Device not found");

    if (device.protocol === "chromecast") {
      const player = this.chromecast.devices.find((d: any) => d.host === host);
      this.device = new ChromecastDevice(player);
    } else if (device.protocol === "dlna") {
      const player = this.dlnacast.players.find((d: any) => d.host === host);
      this.device = new DlnaDevice(player);
    }
    if (!this.device) throw new Error("Device not found");

    this.device.play(media);
  }

  pause() {
    log.debug("cast-pause", this.device?.device?.host);
    this.device?.pause();
  }

  resume() {
    log.debug("cast-resume", this.device?.device?.host);
    this.device?.resume();
  }

  stop() {
    log.debug("cast-stop", this.device?.device?.host);
    this.device?.stop();
  }

  currentStatus() {
    return this.device?.status;
  }
}
