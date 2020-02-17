'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  config = require('../config'),
  chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose');

// Load the mongoose models
module.exports.loadModels = function (callback) {
  // Globbing model files
  config.files.server.models.forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });

  if (callback) callback();
};

// Initialize Mongoose
module.exports.connect = function (callback) {
  mongoose.Promise = config.db.promise;

  // var options = _.merge(config.db.options || {});
  var options = _.merge(
    // config.db.options || {},
    { ssl: false },
    { useNewUrlParser: true },
    { useUnifiedTopology: true }
  );
  mongoose
    .connect(config.db.uri, options)
    .then(function (connection) {
      mongoose.set('useCreateIndex', true);

      mongoose.set('debug', config.db.debug);

      // Call callback FN
      if (callback) callback(connection.connections[0].db);
    })
    .catch(function (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    });

};

module.exports.disconnect = function (cb) {
  mongoose.connection.db
    .close(function (err) {
      console.info(chalk.yellow('Disconnected from MongoDB.'));
      return cb(err);
    });
};
