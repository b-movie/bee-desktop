import settings from "electron-settings";
import path from "path";
import { DEFAULT_CACHE_DIR, TRACKERS } from "./constants";

if (!settings.hasSync("cacheDir")) {
  settings.setSync("cacheDir", DEFAULT_CACHE_DIR);
}
if (!settings.hasSync("subtitlesCacheDir")) {
  settings.setSync(
    "subtitlesCacheDir",
    path.join(DEFAULT_CACHE_DIR, "SubtitlesCache")
  );
}
if (!settings.hasSync("trackers")) {
  settings.setSync("trackers", TRACKERS);
}

(settings as any).resetToDefaults = () => {
  settings.setSync("cacheDir", DEFAULT_CACHE_DIR);
  settings.setSync(
    "subtitlesCacheDir",
    path.join(DEFAULT_CACHE_DIR, "SubtitlesCache")
  );
  settings.setSync("trackers", TRACKERS);
};

export default settings;
