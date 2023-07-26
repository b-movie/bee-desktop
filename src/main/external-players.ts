import fs from "fs";
import log from "electron-log";
import path from "path";
import readdirp from "readdirp";
import { exec } from "child_process";

type ExternalPlayer = {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  cmd?: string;
  switches?: string;
  subswitch?: string;
  urlswitch?: string;
  fs?: string;
  stop?: string;
  pause?: string;
  filenameswitch?: string;
};

const SEARCH_PATHS: any = {
  darwin: ["/Applications", process.env.HOME + "/Applications"],
  linux: [
    "/usr/bin",
    "/usr/local/bin",
    "/snap/bin",
    "/var/lib/flatpak/app/org.videolan.VLC/current/active", //Fedora Flatpak VLC Dir
    process.env.HOME + "/.nix-profile/bin", // NixOS
    "/run/current-system/sw/bin", // NixOS
  ],
  win32: [
    process.env.SystemDrive + "\\Program Files\\",
    process.env.SystemDrive + "\\Program Files (x86)\\",
    process.env.LOCALAPPDATA + "\\Apps\\2.0\\",
  ],
};

const AVAILABLE_PLAYERS: ExternalPlayer[] = [
  {
    id: "vlc",
    name: "VLC",
    icon: "https://assets.baizhiheizi.com/vlc-logo.svg",
    switches: "--no-video-title-show",
    subswitch: "--sub-file=",
    fs: "-f",
    stop: "vlc://quit",
    pause: "vlc://pause",
    filenameswitch: "--meta-title=",
  },
  {
    id: "mpv",
    name: "mpv",
    icon: "https://assets.baizhiheizi.com/mpv-logo.svg",
    switches: "--no-terminal",
    subswitch: "--sub-file=",
    fs: "--fs",
    filenameswitch: "--force-media-title=",
  },
  {
    id: "inna",
    name: "IINA",
    icon: "https://assets.baizhiheizi.com/iina-logo.png",
    cmd: "/Contents/MacOS/iina-cli",
    subswitch: "--mpv-sub-file=",
    fs: "--mpv-fs",
  },
];

export default class ExternalPlayers {
  public list: ExternalPlayer[] = [];

  constructor() {
    log.info("Discovering external players...");
    this.discover();
  }

  discover() {
    const platform = process.platform;
    SEARCH_PATHS[platform].forEach(async (dir: string) => {
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
        const matches = AVAILABLE_PLAYERS.filter(
          (v) => v.name.toLowerCase() === app
        );

        if (matches.length) {
          const player = matches[0];
          log.info("Found: ", player);
          this.list.push(
            Object.assign(player, {
              path: entry.fullPath,
            })
          );
        }
      }
    });

    return this.list;
  }

  play(
    playerId: string,
    params: { url: string; title: string; subtitle: string }
  ) {
    log.info("ExternalPlayers.play", playerId, params);

    const player = this.list.find((p) => p.id === playerId);
    if (!player) return;

    const { url, subtitle = "", title = "" } = params;
    if (!url) return;

    let cmd = "";
    let cmdPath = "";
    let cmdSwitch = "";
    let cmdSub = "";
    let cmdFs = "";
    let cmdFilename = "";
    let cmdUrl = "";

    // A conditional check to see if VLC was installed via flatpak
    player.path.includes("/flatpak/app/org.videolan.VLC/")
      ? (cmdPath = "/usr/bin/flatpak run org.videolan.VLC ")
      : (cmdPath += path.normalize('"' + player.path + '" '));

    cmdSwitch += player.switches + " ";

    if (subtitle !== "") {
      cmdSub += player.subswitch + '"' + subtitle + '" ';
    }
    if (player.fs !== "") {
      // Start player fullscreen if available and asked
      cmdFs += player.fs + " ";
    }
    if (player.filenameswitch !== "") {
      cmdFilename += title ? player.filenameswitch + '"' + title + '" ' : "";
    }

    cmdUrl = `"${player.urlswitch ? player.urlswitch + url : url}"`;

    cmd += cmdPath + cmdSwitch + cmdSub + cmdFs + cmdFilename + cmdUrl;
    log.info("Launching External Player: " + cmd);
    return exec(cmd, function (error, stdout, stderr) {
      if (error) log.error(error);

      log.info(stdout);
      log.error(stderr);
    });
  }

  stop(playerId: string) {
    log.info("ExternalPlayers.play", playerId);

    const player = this.list.find((p) => p.id === playerId);
    if (!player) return;
  }

  pause(playerId: string) {
    log.info("ExternalPlayers.play", playerId);

    const player = this.list.find((p) => p.id === playerId);
    if (!player) return;
  }

  resume(playerId: string) {
    log.info("ExternalPlayers.play", playerId);

    const player = this.list.find((p) => p.id === playerId);
    if (!player) return;
  }
}
