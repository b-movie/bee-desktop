import type { Configuration } from "webpack";
import CopyPlugin from "copy-webpack-plugin";
const PermissionsOutputPlugin = require("webpack-permissions-plugin");
import WebpackShellPluginNext from "webpack-shell-plugin-next";
import os from "os";
import path from "path";
import { rules } from "./webpack.rules";

const platform = os.platform();

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/index.ts",
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  externals: [
    {
      "utp-native": "commonjs utp-native",
    },
  ],
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: `libs/mpv/${platform}`, to: "libs/mpv" },
        { from: "libs/mpv/config", to: "libs/mpv/config" },
        { from: "assets", to: "assets" },
      ],
    }),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          "chmod +x .webpack/main/libs/mpv/mpv",
          "chmod +x .webpack/main/libs/mpv/mpv.exe",
        ],
        blocking: false,
        parallel: true,
      },
    }),
  ],
};
