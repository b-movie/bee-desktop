// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("__BEE__", {
  cast: {
    init: () => ipcRenderer.invoke("cast-init"),
    update: () => ipcRenderer.invoke("cast-update"),
    devices: () => ipcRenderer.invoke("cast-devices"),
    play: (host: string, media: CastMedia) =>
      ipcRenderer.invoke("cast-play", host, media),
    pause: () => ipcRenderer.invoke("cast-pause"),
    resume: () => ipcRenderer.invoke("cast-resume"),
    stop: () => ipcRenderer.invoke("cast-stop"),
    currentStatus: () => ipcRenderer.invoke("cast-current-status"),
  },
  client: {
    platform: "desktop",
    version: require("../package.json").version,
    ip: () => ipcRenderer.invoke("client-ip"),
  },
  fs: {
    readFile: (path: string) => ipcRenderer.invoke("fs-read-file", path),
    download: (url: string, path: string) =>
      ipcRenderer.invoke("fs-download", url, path),
  },
  mpv: {
    play: (url: string, options: string[] = []) =>
      ipcRenderer.invoke("mpv-play", url, options),
    pause: () => ipcRenderer.invoke("mpv-pause"),
    resume: () => ipcRenderer.invoke("mpv-resume"),
    quit: () => ipcRenderer.invoke("mpv-quit"),
    isRunning: () => ipcRenderer.invoke("mpv-is-running"),
    goToPosition: (position: number) => {
      ipcRenderer.invoke("mpv-go-to-position", position);
    },
    addSubtitles: (file: string, flag: string, title: string, lang: string) => {
      ipcRenderer.invoke("mpv-add-subtitles", file, flag, title, lang);
    },
    observeProperty: (property: string) => {
      ipcRenderer.invoke("mpv-observe-property", property);
    },
    unobserveProperty: (property: string) => {
      ipcRenderer.invoke("mpv-unobserve-property", property);
    },
    onStatus: (callback: (event: IpcRendererEvent, status: any) => void) =>
      ipcRenderer.on("mpv-on-status", callback),
    getProperty: (property: string) =>
      ipcRenderer.invoke("mpv-get-property", property),
    getTimePosition: () => ipcRenderer.invoke("mpv-get-time-position"),
    getPercentPosition: () => ipcRenderer.invoke("mpv-get-percent-position"),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners("mpv-on-status");
    },
  },
  opensubtitles: {
    login: (username: string, password: string) =>
      ipcRenderer.invoke("opensubtitles-search", username, password),
    search: (options: Object) =>
      ipcRenderer.invoke("opensubtitles-search", options),
    download: (id: string) => ipcRenderer.invoke("opensubtitles-download", id),
  },
  settings: {
    refresh: () => ipcRenderer.invoke("settings-refresh"),
    get: (key: string) => ipcRenderer.invoke("settings-get", key),
    set: (key: string, value: any) =>
      ipcRenderer.invoke("settings-set", key, value),
  },
  shell: {
    openExternal: (url: string) =>
      ipcRenderer.invoke("shell-open-external", url),
    openPath: (path: string) => ipcRenderer.invoke("shell-open-path", path),
  },
  store: {
    get: (key: string) => ipcRenderer.invoke("store-get", key),
  },
  torrent: {
    init: () => ipcRenderer.invoke("torrent-init"),
    seed: (meta: Meta) => ipcRenderer.invoke("torrent-seed", meta),
    pause: (infoHash: String) => ipcRenderer.invoke("torrent-pause", infoHash),
    resume: (infoHash: String) =>
      ipcRenderer.invoke("torrent-resume", infoHash),
    summary: () => ipcRenderer.invoke("torrent-summary"),
    torrentFile: (infoHash: string) =>
      ipcRenderer.invoke("torrent-torrent-file", infoHash),
    currentState: (infoHash: string) =>
      ipcRenderer.invoke("torrent-current-state", infoHash),
    selectFile: (infoHash: string, fileIdx: number) =>
      ipcRenderer.invoke("torrent-select-file", infoHash, fileIdx),
    deselectAll: (infoHash: string) =>
      ipcRenderer.invoke("torrent-deselect-all", infoHash),
    destroy: (infoHash: string) =>
      ipcRenderer.invoke("torrent-destroy", infoHash),
    destroyAll: () => ipcRenderer.invoke("torrent-destroy-all"),
    onError: (callback: (event: IpcRendererEvent, error: Error) => void) =>
      ipcRenderer.on("torrent-on-error", callback),
    onState: (callback: (event: IpcRendererEvent, state: Torrent) => void) =>
      ipcRenderer.on("torrent-on-state", callback),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners("torrent-on-error");
      ipcRenderer.removeAllListeners("torrent-on-state");
    },
  },
  webpage: {
    parse: (url: string) => ipcRenderer.invoke("webpage-parse", url),
  },
});
