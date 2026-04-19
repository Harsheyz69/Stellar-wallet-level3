const { override } = require("react-app-rewired");
const webpack = require("webpack");

module.exports = function override(config) {
  // Polyfill Node.js core modules for Stellar SDK compatibility
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve("buffer/"),
    stream: require.resolve("stream-browserify"),
    crypto: require.resolve("crypto-browserify"),
    process: require.resolve("process/browser.js"),
  };

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser.js",
    }),
  ];

  // Ignore source-map warnings from stellar-sdk
  config.ignoreWarnings = [/Failed to parse source map/];

  // Fix Webpack strict ESM module issues with twind and other internal modules
  config.module = config.module || { rules: [] };
  config.module.rules.push({
    test: /\.m?js/,
    resolve: { fullySpecified: false },
    type: "javascript/auto"
  });

  return config;
};
