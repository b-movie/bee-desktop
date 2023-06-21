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
