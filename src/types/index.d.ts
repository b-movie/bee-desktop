declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare module "rum-torrent";
declare module "parse-torrent";
declare module "create-torrent";
declare module "node-mpv";
declare module "webpack-permissions-plugin";
declare module "dlnacasts";
declare module "chromecasts";
declare module "ip";

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
  name: string;
  infoHash: string;
  magnetURI: string;
  torrentFile: string;
  announce: string[];
  files: TorrentFile[];
  timeRemaining: string;
  received: string;
  downloaded: string;
  uploaded: string;
  downloadSpeed: number;
  uploadSpeed: number;
  progress: string;
  ratio: string;
  numPeers: string;
  path: string;
  ready: boolean;
  paused: boolean;
  done: boolean;
  length: number;
  created: Date;
  createdBy: string;
  comment: string;
};

type TorrentFile = {
  name: string;
  path: string;
  length: number;
  downloaded: number;
  progress: number;
  streamUrl: string;
};
