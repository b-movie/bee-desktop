import { exec } from "child_process";
import path from "path";
import log from "electron-log";
import ip from "ip";
import { subtitlesServer } from "../subtitles-server";

export default class GenericPlayer {
  public config: PlayerConfig;

  constructor(config: PlayerConfig) {
    this.config = config;
  }

  play(params: MediaParams) {
    const { url, subtitles = [], title = "" } = params;
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

    const subtitle = subtitles[0]?.url || "";
    if (subtitle) {
      cmdSub += this.config.subswitch + '"' + subtitle + '" ';
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
    log.info("Launching External Player: " + cmd);
    exec(cmd, function (error, stdout, stderr) {
      if (error) log.error(error);

      log.info(stdout);
      log.error(stderr);
    });
  }

  pause() {}

  resume() {}

  stop() {}

  status() {}

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
