module.exports = {
  publicPath: "./",
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      alias: {
        // src下的新闻夹
        assets: "@/assets",
        components: "@/components",
        views: "@/views",
      },
    },
  },
  devServer: {
    client: {
      overlay: false,
    },
  },
};
