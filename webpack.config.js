const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // Set mode to 'development' or 'production' based on your environment
  mode: process.env.NODE_ENV || 'development',
  
  // Entry point for the application
  entry: './src/index.js',

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },

  // Module rules for handling different types of files
  module: {
    rules: [
      {
        // Babel loader to transpile JS files using Babel
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        // CSS loader for handling CSS files
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // File loader for images
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: 'images/',
          },
        },
      },
      {
        // Handling fonts
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: 'fonts/',
          },
        },
      },
      {
        // Exclude source maps from node_modules (if not necessary for debugging)
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules/,
      },
    ],
  },

  // Plugins to extend Webpack functionality
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'body',
    }),
    new CleanWebpackPlugin(), // Cleans the dist folder before each build
  ],

  // Resolve paths to import dependencies easily
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
    extensions: ['.js', '.jsx', '.json'], // Resolve these file types
  },

  // DevServer configuration for development environment
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3000,
    hot: true,
    historyApiFallback: true, // Allows for client-side routing (e.g., React Router)
    open: true, // Opens the browser automatically
  },

  // Source map configuration for debugging in development
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map',

  // Optionally, ignore specific warnings like source-map-loader
  ignoreWarnings: [
    {
      module: /source-map-loader/,
    },
  ],
};
