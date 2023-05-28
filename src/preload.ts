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
      players: () => ipcRenderer.invoke("chromecasts-players"),
      play: (url: string, host: string, options: Object) =>
        ipcRenderer.invoke("chromecasts-play", url, host, options),
      onStatus: (callback: (event: IpcRendererEvent, status: any) => void) => {
        ipcRenderer.on("chromecasts-player-status", callback);
      },
      removeAllListeners: () => {
        ipcRenderer.removeAllListeners("chromecasts-player-status");
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
      ipcRenderer.on("mpv-error", callback),
    onStarted: (callback: (event: IpcRendererEvent) => void) =>
      ipcRenderer.on("mpv-started", callback),
    onPaused: (callback: (event: IpcRendererEvent) => void) =>
      ipcRenderer.on("mpv-paused", callback),
    onStopped: (callback: (event: IpcRendererEvent) => void) =>
      ipcRenderer.on("mpv-stopped", callback),
    onSeek: (callback: (event: IpcRendererEvent) => void) =>
      ipcRenderer.on("mpv-seek", callback),
    onStateUpdated: (callback: (event: IpcRendererEvent, state: any) => void) =>
      ipcRenderer.on("mpv-state-updated", callback),
    onTimePositionUpdated: (
      callback: (event: IpcRendererEvent, time: number) => void
    ) => ipcRenderer.on("mpv-time-position-updated", callback),
    getProperty: (property: string) =>
      ipcRenderer.invoke("mpv-get-property", property),
    getTimePosition: () => ipcRenderer.invoke("mpv-get-time-position"),
    getPercentPosition: () => ipcRenderer.invoke("mpv-get-percent-position"),
    removeErrorListener: () => ipcRenderer.removeAllListeners("mpv-error"),
    removeStateUpdatedListener: () =>
      ipcRenderer.removeAllListeners("mpv-state-updated"),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners("mpv-error");
      ipcRenderer.removeAllListeners("mpv-started");
      ipcRenderer.removeAllListeners("mpv-stopped");
      ipcRenderer.removeAllListeners("mpv-paused");
      ipcRenderer.removeAllListeners("mpv-seek");
      ipcRenderer.removeAllListeners("mpv-state-updated");
      ipcRenderer.removeAllListeners("mpv-time-position-updated");
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
