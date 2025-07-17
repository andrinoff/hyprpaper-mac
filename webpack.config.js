const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  // The entry point for the renderer process
  entry: {
    main: "./src/App.jsx",
  },
  // Target the electron renderer process
  target: "electron-renderer",
  // Where the bundled code will be output
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  // Rules for how to handle different file types
  module: {
    rules: [
      {
        // For .js and .jsx files, use babel-loader
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
      {
        // For .css files, use style-loader and css-loader
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  // Configure how modules are resolved
  resolve: {
    extensions: [".js", ".jsx"],
  },
  // Setup the plugin to generate the index.html file
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      chunks: ["main"],
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "src/themes", to: "themes" }],
    }),
  ],
};
