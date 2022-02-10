/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
 module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  ignoredRouteFiles: [".*"],
  publicPath: "/build/",
  serverBuildDirectory: "src/build",
  serverModuleFormat: "esm",
  serverPlatform: "neutral"
};
