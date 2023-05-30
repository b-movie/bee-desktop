// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("__BEE__", {
  cast: {
    dlna: {
      players: () => ipcRenderer.invoke("dlnacasts-players"),
      play: (url: string, host: string, options: Object) =>
        ipcRenderer.invoke("dlnacasts-play", url, host, options),
      onStatus: (callback: (event: IpcRendererEvent, status: any) => void) => {
        ipcRenderer.on("dlnacasts-player-status", callback);
      },
      removeAllListeners: () => {
        ipcRenderer.removeAllListeners("dlnacasts-player-status");
      },
    },
    chrome: {
      devices: () => ipcRenderer.invoke("chromecast-devices"),
      play: (host: string, media: Object, options: Object) =>
        ipcRenderer.invoke("chromecast-play", host, media, options),
      pause: (host: string) => ipcRenderer.invoke("chromecast-pause", host),
      resume: (host: string) => ipcRenderer.invoke("chromecast-resume", host),
      stop: (host: string) => ipcRenderer.invoke("chromecast-stop", host),
      close: (host: string) => ipcRenderer.invoke("chromecast-close", host),
      currentTime: (host: string) =>
        ipcRenderer.invoke("chromecast-current-time", host),
      currentStatus: (host: string) =>
        ipcRenderer.invoke("chromecast-current-status", host),
      onStatus: (callback: (event: IpcRendererEvent, status: any) => void) => {
        ipcRenderer.on("chromecast-device-status", callback);
      },
      removeAllListeners: () => {
        ipcRenderer.removeAllListeners("chromecast-device-status");
      },
    },
  },
  client: {
    platform: "desktop",
    version: require("../package.json").version,
  },
  fs: {
    readFile: (path: string) => ipcRenderer.invoke("fs-read-file", path),
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
    onError: (callback: (event: IpcRendererEvent, error: Error) => void) =>
      ipcRenderer.on("mpv-on-error", callback),
    onStarted: (callback: (event: IpcRendererEvent) => void) =>
      ipcRenderer.on("mpv-on-started", callback),
    onPaused: (callback: (event: IpcRendererEvent) => void) =>
      ipcRenderer.on("mpv-on-paused", callback),
    onStopped: (callback: (event: IpcRendererEvent) => void) =>
      ipcRenderer.on("mpv-on-stopped", callback),
    onSeek: (callback: (event: IpcRendererEvent) => void) =>
      ipcRenderer.on("mpv-on-seek", callback),
    onStatus: (callback: (event: IpcRendererEvent, status: any) => void) =>
      ipcRenderer.on("mpv-on-status", callback),
    onTimePosition: (
      callback: (event: IpcRendererEvent, time: number) => void
    ) => ipcRenderer.on("mpv-on-time-position", callback),
    getProperty: (property: string) =>
      ipcRenderer.invoke("mpv-get-property", property),
    getTimePosition: () => ipcRenderer.invoke("mpv-get-time-position"),
    getPercentPosition: () => ipcRenderer.invoke("mpv-get-percent-position"),
    removeErrorListener: () => ipcRenderer.removeAllListeners("mpv-error"),
    removeOnStatusListener: () => ipcRenderer.removeAllListeners("mpv-on-status"),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners("mpv-on-error");
      ipcRenderer.removeAllListeners("mpv-on-started");
      ipcRenderer.removeAllListeners("mpv-on-stopped");
      ipcRenderer.removeAllListeners("mpv-on-paused");
      ipcRenderer.removeAllListeners("mpv-on-seek");
      ipcRenderer.removeAllListeners("mpv-on-status");
      ipcRenderer.removeAllListeners("mpv-on-time-position");
    },
  },
  opensubtitles: {
    search: (query: string) =>
      ipcRenderer.invoke("opensubtitles-search", query),
    download: (id: string) => ipcRenderer.invoke("opensubtitles-download", id),
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
    summary: () => ipcRenderer.invoke("torrent-summary"),
    torrentFile: (infoHash: string) =>
      ipcRenderer.invoke("torrent-torrent-file", infoHash),
    currentState: (infoHash: string) =>
      ipcRenderer.invoke("torrent-current-state", infoHash),
    setPriority: (infoHash: string, fileIndex: number, priority: number) =>
      ipcRenderer.invoke("torrent-set-priority", infoHash, fileIndex, priority),
    destroy: (infoHash: string) =>
      ipcRenderer.invoke("torrent-destroy", infoHash),
    destroyAll: () => ipcRenderer.invoke("torrent-destroy-all"),
    onError: (callback: (event: IpcRendererEvent, error: Error) => void) =>
      ipcRenderer.on("torrent-error", callback),
    removeErrorListener: () => ipcRenderer.removeAllListeners("torrent-error"),
    onStateUpdated: (
      callback: (event: IpcRendererEvent, state: Torrent) => void
    ) => ipcRenderer.on("torrent-state-updated", callback),
    removeStateUpdatedListener: () =>
      ipcRenderer.removeAllListeners("torrent-state-updated"),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners("torrent-error");
      ipcRenderer.removeAllListeners("torrent-state-updated");
    },
  },
});
