import settings from "electron-settings";
import fs from "fs";
import { DEFAULT_CACHE_DIR, TRACKERS } from "./constants";

if (!settings.hasSync("cacheDir")) {
  settings.setSync("cacheDir", DEFAULT_CACHE_DIR);
}
if (!settings.hasSync("trackers")) {
  settings.setSync("trackers", TRACKERS);
}

const cacheDir: string = settings.getSync("cacheDir") as string;
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

(settings as any).resetToDefaults = () => {
  settings.setSync("cacheDir", DEFAULT_CACHE_DIR);
  settings.setSync("trackers", TRACKERS);
};

export default settings;
