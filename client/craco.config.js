module.exports = {
  devServer: {
    host: '0.0.0.0',               // 👈 to dodaj
    allowedHosts: 'all',
    port: 3008,
    historyApiFallback: true,
    proxy: {
      '/login': 'http://localhost:3009',
      '/register': 'http://localhost:3009',
      '/check-email': 'http://localhost:3009',
      '/change-password': 'http://localhost:3009',
      '/reset-password': 'http://localhost:3009',
      '/entries': 'http://localhost:3009',
      '/api': 'http://localhost:3009'
    }
  },

  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'development') {
        webpackConfig.devServer = {
          ...webpackConfig.devServer,
          client: {
            webSocketURL: 'wss://bk-offer.pl/ws'
          }
        };
      }
      return webpackConfig;
    }
  }
};
