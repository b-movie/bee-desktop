import type { Configuration } from "webpack";
import CopyPlugin from "copy-webpack-plugin";

import { rules } from "./webpack.rules";

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
        { from: "libs/mpv/config", to: "libs/mpv/config" },
        { from: "assets", to: "assets" }
      ],
    }),
  ],
};
