const path = require('path');

module.exports = {
  mode: 'development', // lub 'production'
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    // publicPath określa ścieżkę, pod którą będą serwowane zasoby
    // w dev-server może być użyte np. '/dist/'
    publicPath: '/'
  },
  module: {
    rules: [
      // Przykładowe reguły
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devServer: {
    // Port, na którym nasłuchuje devServer
    port: 3008,

    // Host 0.0.0.0 pozwala na dostęp z zewnątrz (jeśli puścisz to na VPS)
    host: '0.0.0.0',

    // allowedHosts: 'all' umożliwia łączenie się z każdej domeny
    allowedHosts: 'all',

    // Jeżeli twoja aplikacja to SPA, historyApiFallback zapewni obsługę podstron
    historyApiFallback: true,

    // Konfiguracja WebSocketu (dla HMR / live reload)
    client: {
      // Adres, którego użyje WebSocket
      webSocketURL: 'wss://bk-offer.pl/ws'
    },

    // Tylko w razie potrzeby – aby devServer nasłuchiwał na https lokalnie
    // https: true,

    // compress: true – włącza kompresję gzip
    compress: true,

    // static – skąd serwujesz pliki statyczne (np. /public)
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },

    // hot – włącza Hot Module Replacement
    hot: true
  }
};
