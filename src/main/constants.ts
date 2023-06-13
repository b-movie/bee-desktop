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
  "udp://exodus.desync.com:6969/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.moeking.me:6969/announce",
  "udp://explodie.org:6969/announce",
  "udp://uploads.gamecoast.net:6969/announce",
  "udp://tracker2.dler.org:80/announce",
  "udp://tracker1.bt.moack.co.kr:80/announce",
  "udp://tracker.tiny-vps.com:6969/announce",
  "udp://tracker.bitsearch.to:1337/announce",
  "udp://retracker01-msk-virt.corbina.net:80/announce",
  "udp://movies.zsw.ca:6969/announce",
  "udp://aarsen.me:6969/announce",
  "https://tracker.tamersunion.org:443/announce",
  "https://tr.burnabyhighstar.com:443/announce",
  "wss://tracker.files.fm:7073/announce",
  "ws://tracker.files.fm:7072/announce",
];
