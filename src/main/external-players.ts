import fs from "fs";
import log from "electron-log";
import path from "path";
import readdirp from "readdirp";

type ExternalPlayer = {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  cmd?: string;
  switches?: string;
  subswitch?: string;
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
    switches: "--no-terminal",
    subswitch: "--sub-file=",
    fs: "--fs",
    filenameswitch: "--force-media-title=",
  },
  {
    id: "inna",
    name: "IINA",
    cmd: "/Contents/MacOS/iina-cli",
    subswitch: "--mpv-sub-file=",
    fs: "--mpv-fs",
  },
];

export default class ExternalPlayers {
  public list: ExternalPlayer[] = [];

  constructor() {
    this.discover();
  }

  discover() {
    const platform = process.platform;
    SEARCH_PATHS[platform].forEach(async (dir: string) => {
      if (!fs.existsSync(dir)) return;

      dir = path.resolve(dir);
      log.info("Scanning: " + dir);

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

    return ExternalPlayers.list;
  }

  play(playerId: string, params: string[]) {}

  stop(playerId: string) {}

  pause(playerId: string) {}

  resume(playerId: string) {}
}
