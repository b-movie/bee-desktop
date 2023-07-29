import os from "os";
import path from "path";

export const OPENSUBTITLES_API_KEY = "6odoYlui4gEXjCYZyAB8tUxSDpDlfAMw";
export const CACHE_DIR = path.join(os.tmpdir(), "BEE");
export const SUBTITLE_CACHE_DIR = path.join(CACHE_DIR, "SubtitlesCache");
export const TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://opentracker.i2p.rocks:6969/announce",
  "udp://tracker.openbittorrent.com:6969/announce",
  "http://tracker.openbittorrent.com:80/announce",
  "udp://open.demonii.com:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://exodus.desync.com:6969/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.moeking.me:6969/announce",
  "udp://tracker.bitsearch.to:1337/announce",
  "udp://p4p.arenabg.com:1337/announce",
  "udp://explodie.org:6969/announce",
  "http://bt.endpot.com:80/announce",
  "udp://tracker2.dler.org:80/announce",
  "udp://tracker1.bt.moack.co.kr:80/announce",
  "udp://tracker.theoks.net:6969/announce",
  "udp://movies.zsw.ca:6969/announce",
  "https://tracker.tamersunion.org:443/announce",
  "https://tr.burnabyhighstar.com:443/announce",
  "http://open.acgnxtracker.com:80/announce",
];
export const DEFAULT_SETTINGS = {
  cacheDir: CACHE_DIR,
  subtitlesCacheDir: SUBTITLE_CACHE_DIR,
  trackers: TRACKERS,
};

export const PLAYER_SEARCH_PATHS: any = {
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

export const MPV_SUB_FILE_PATHS = ["subs", "Subs", "subtitles"];
export const SUPPORTED_PLAYERS: PlayerConfig[] = [
  {
    id: "vlc",
    type: "vlc",
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
    type: "mpv",
    name: "mpv",
    icon: "https://assets.baizhiheizi.com/mpv-logo.svg",
    switches: `--fs --save-position-on-quit --sub-auto=all --sub-file-paths=${
      process.platform === "win32"
        ? MPV_SUB_FILE_PATHS.join(";")
        : MPV_SUB_FILE_PATHS.join(":")
    }`,
    subswitch: "--sub-file=",
    fs: "--fs",
    filenameswitch: "--force-media-title=",
  },
  {
    id: "inna",
    type: "iina",
    name: "IINA",
    icon: "https://assets.baizhiheizi.com/iina-logo.png",
    cmd: "/Contents/MacOS/iina-cli",
    subswitch: "--mpv-sub-file=",
    fs: "--mpv-fs",
  },
];
