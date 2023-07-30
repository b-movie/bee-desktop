import { exec } from "child_process";
import path from "path";
import log from "electron-log";
import ip from "ip";
import { subtitlesServer } from "../subtitles-server";

export default class GenericPlayer {
  public _status: any = {};
  public config: PlayerConfig;

  constructor(config: PlayerConfig) {
    this.config = config;
  }

  play(params: MediaParams) {
    const { url, subtitles = [], title = "", options = {} } = params;
    if (!url) return;

    let cmd = "";
    let cmdPath = "";
    let cmdSwitch = "";
    let cmdSub = "";
    let cmdFs = "";
    let cmdFilename = "";
    let cmdUrl = "";

    // A conditional check to see if VLC was installed via flatpak
    this.config.path.includes("/flatpak/app/org.videolan.VLC/")
      ? (cmdPath = "/usr/bin/flatpak run org.videolan.VLC ")
      : (cmdPath += path.normalize('"' + this.config.path + '" '));

    cmdSwitch += this.config.switches + " ";

    let subtitle = subtitles[0]?.url || "";
    if (subtitle && this.config.subswitch) {
      subtitle = subtitle.replace("localhost", ip.address());
      cmdSub += this.config.subswitch + '"' + subtitle + '" ';
    }
    if (options.startTime && this.config.startswitch) {
      cmdSub += this.config.startswitch + options.startTime + " ";
    }
    if (this.config.fs) {
      cmdFs += this.config.fs + " ";
    }
    if (this.config.filenameswitch) {
      cmdFilename += title
        ? this.config.filenameswitch + '"' + title + '" '
        : "";
    }

    cmdUrl = `"${this.config.urlswitch ? this.config.urlswitch + url : url}"`;

    cmd += cmdPath + cmdSwitch + cmdSub + cmdFs + cmdFilename + cmdUrl;
    const exe = exec(cmd, function (error, stdout, stderr) {
      if (error) {
        log.error(error);
      } else {
        log.info("Launched External Player: " + cmd);
      }

      log.info(stdout);
      log.error(stderr);
    });

    this._status = {
      playerState: "PLAYING",
    };

    exe.on("exit", (code) => {
      log.info("External Player exited with code " + code);
      this._status = {
        playerState: "STOPPED",
      };
    });
  }

  pause() {}

  resume() {}

  stop() {
    this._status = {};
  }

  status() {
    return this._status;
  }

  serveSubtitles(subtitles: any[]) {
    subtitles
      .filter((sub) => sub.url)
      .forEach(async (sub, index) => {
        const url = await subtitlesServer.serve(sub.url);
        subtitles[index].url = url?.replace("localhost", ip.address());
      });
    subtitles = subtitles.filter((sub) => sub.url);

    if (subtitles.length === 0) return null;
    return subtitles;
  }
}
