module.exports = {
  // Prosta konfiguracja devServer (poziom CRACO)
  devServer: {
    allowedHosts: 'all',
    port: 3008
  },

  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'development') {
        webpackConfig.devServer = {
          ...webpackConfig.devServer,
          client: {
            // Adres WebSocket
            webSocketURL: 'wss://desk.berlin-opiekunki.pl/ws'
          }
        };
      }
      return webpackConfig;
    }
  }
};
