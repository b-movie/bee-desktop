declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare module "webtorrent";
declare module "finalhandler";
declare module "node-mpv";
declare module "webpack-permissions-plugin";
declare module "dlnacasts2";
declare module "chromecast-api";
declare module "opensubtitles.com";
declare module "ip";
declare module "got";

type Meta = {
  infoHash?: string;
  magnetURI?: string;
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

type PlayerConfig = {
  id: string; // host for cast player, id for external player
  type: string; // protocol for casting
  name: string;
  path?: string;
  cmd?: string;
  switches?: string;
  startswitch?: string;
  subswitch?: string;
  urlswitch?: string;
  fs?: string;
  stop?: string;
  pause?: string;
  filenameswitch?: string;
};

type MediaParams = {
  url: string;
  title?: string;
  cover?: {
    title?: string;
    url: string;
  };
  subtitles?: {
    url: string;
    name?: string;
    lang?: string;
  }[];
  options?: {
    startTime?: number;
  };
};
