module.exports = {
  // Prosta konfiguracja devServer (poziom CRACO)
  devServer: {
    allowedHosts: 'all',
    port: 3000
  },

  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'development') {
        webpackConfig.devServer = {
          ...webpackConfig.devServer,
          client: {
            // Adres WebSocket
            webSocketURL: 'wss://bk-offer.pl/ws'
          }
        };
      }
      return webpackConfig;
    }
  }
};
