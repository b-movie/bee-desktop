// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("__BEE__", {
  client: 'desktop',
  version: '0.0.1',
});
