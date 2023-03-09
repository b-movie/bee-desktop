declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare module "rum-torrent";
declare module "parse-torrent";
declare module "create-torrent";

type Meta = {
  infoHash: string;
  fileIdx: number;
  title: string;
  type: "movie" | "series";
  season?: number;
  episode?: number;
  imdbId?: string;
  backdropUrl?: string;
  posterUrl?: string;
  beeUrl?: string;
};

type Torrent = {
    status: string;
    name: string;
    infoHash: string;
    magnet: string;
    speed: string;
    path: string;
    downloaded: string;
    uploaded: string;
    runningTime: string;
    timeRemaining: string;
    trackers: string[];
    peers: string[];
    files: string[];
    wires: string[];
}

type TorrentClientInfo = {
  peerId: string;
  nodeId: string;
  externalIp: string;
  dhtPort: number;
  dhtNatUpnp: string;
  torrentPort: number;
  torrentNatUpnp: string;
  httpPort: number;
  torrents: Torrent[];
};
