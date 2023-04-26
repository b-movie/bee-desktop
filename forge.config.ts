import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./assets/icon",
    executableName: "bee-desktop",
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: "BeeDesktop",
      setupIcon: "./assets/icon.ico",
    }),
    new MakerZIP({}, ["darwin", "win32"]),
    new MakerRpm({}),
    new MakerDeb({
      options: {
        name: "bee-desktop",
        productName: "BeeDesktop",
        icon: "./assets/icon.png",
      },
    }),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/renderer.ts",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
      port: 3001,
      loggerPort: 9001,
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "b-movie",
          name: "bee-desktop",
        },
        draft: true,
      },
    },
  ],
};

export default config;
