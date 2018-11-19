module.exports = {
  'globDirectory': 'dist/',
  'globPatterns': [
    '**/*.{css,min.js,png,ico,gif}'
  ],
  'swDest': 'dest/public/sw.js',

  runtimeCaching: [{
    urlPattern: /\.(?:png|jpg|jpeg|ico|svg)$/,
    handler: 'cacheFirst',

    options: {
      cacheName: 'images'
    }
  }]
};
