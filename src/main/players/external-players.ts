import fs from "fs";
import log from "electron-log";
import path from "path";
import readdirp from "readdirp";
import {
  PLAYER_SEARCH_PATHS,
  SUPPORTED_PLAYERS,
  MPV_SUB_FILE_PATHS,
} from "../constants";
import GenericPlayer from "./generic-player";
import MpvPlayer from "./mpv-player";
import ChromecastPlayer from "./chromecast-player";
import DlnaPlayer from "./dlna-player";
import ChromecastAPI from "chromecast-api";

export class ExternalPlayers {
  private chromecast: any;
  private dlnacast: any;
  private players: {
    [key: string]: GenericPlayer | MpvPlayer | ChromecastPlayer | DlnaPlayer;
  } = {};
  public list: PlayerConfig[] = [];

  constructor() {
    log.info("Discovering external players...");

    this.chromecast = new ChromecastAPI();
    this.dlnacast = require("dlnacasts2")();
    this.discoverInstalledPlayers();
  }

  discover() {
    this.discoverCastPlayers();
  }

  discoverCastPlayers() {
    this.chromecast.update();
    this.chromecast.devices.forEach((device: any) => {
      log.info("found chromecast:", device.name, device.host);
      const player = {
        id: device.host,
        type: "chromecast",
        name: device.friendlyName || device.name,
      };

      if (!this.players[device.host]) {
        this.players[device.host] = new ChromecastPlayer(player, device);
      }

      if (this.list.findIndex((v) => v.id === device.host) !== -1) return;
      this.list.push(player);
    });

    this.dlnacast.update();
    this.dlnacast.players.forEach((device: any) => {
      log.info("found DLNA:", device.name, device.host);
      const player = {
        id: device.host,
        type: "dlna",
        name: device.friendlyName || device.name,
      };

      if (!this.players[device.host]) {
        this.players[device.host] = new DlnaPlayer(player, device);
      }

      if (this.list.findIndex((v) => v.id === device.host) !== -1) return;
      this.list.push(player);
    });
  }

  async discoverInstalledPlayers() {
    const platform = process.platform;
    await Promise.all(
      PLAYER_SEARCH_PATHS[platform].map(async (dir: string) => {
        if (!fs.existsSync(dir)) return;

        dir = path.resolve(dir);
        log.info("ExternalPlayers scanning: " + dir);

        const fileStream = readdirp(dir, {
          depth: 3,
        });

        for await (const entry of fileStream) {
          const app = entry.basename
            .replace(".app", "")
            .replace(".exe", "")
            .toLowerCase();
          const matches = SUPPORTED_PLAYERS.filter(
            (v) => v.name.toLowerCase() === app
          );

          if (!matches.length) continue;
          if (this.list.findIndex((v) => v.id === matches[0].id) !== -1)
            continue;

          const player = Object.assign(matches[0], {
            path: entry.fullPath,
          });
          log.info("Found: ", player);
          this.list.push(player);

          if (player.id === "mpv") {
            this.players.mpv = new MpvPlayer(player);
          } else {
            this.players[player.id] = new GenericPlayer(player);
          }
        }
      })
    );

    // Add bundled MPV if not found
    if (this.list.findIndex((v) => v.id === "mpv") === -1) {
      this.list.push({
        id: "mpv",
        type: "mpv",
        name: "MPV",
        path:
          platform === "win32"
            ? path.join(__dirname, "libs/mpv/mpv.exe")
            : path.join(__dirname, "libs/mpv/mpv"),
        switches: `--fs --save-position-on-quit --sub-auto=all --sub-file-paths=${
          process.platform === "win32"
            ? MPV_SUB_FILE_PATHS.join(";")
            : MPV_SUB_FILE_PATHS.join(":")
        } --config-dir=${path.join(__dirname, "libs/mpv/config")}`,
      });
    }
  }

  play(id: string, media: MediaParams) {
    const player = this.players[id];
    if (!player) return;

    log.info("play", id, media);
    player.play(media);
  }

  stop(id: string) {
    const player = this.players[id];
    if (!player) return;

    player.stop();
  }

  pause(id: string) {
    const player = this.players[id];
    if (!player) return;

    player.pause();
  }

  resume(id: string) {
    const player = this.players[id];
    if (!player) return;

    player.resume();
  }

  async status(id: string) {
    const player = this.players[id];
    if (!player) return;

    const status = await player.status();
    log.info(`${id} player status:`, status);

    return status;
  }
}

export const externalPlayers = new ExternalPlayers();
