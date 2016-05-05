'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Child = mongoose.model('Child'),
  request = require('request'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
  // configEnvy = require('config-envy')({
  //   env: process.env.NODE_ENV, // The environment config to pull from. Will be based on the `env` property of the lane
  //   cwd: process.cwd(), // The current working directory to base storage options from
  //   localEnv: '.env', // The path to an overriding .env for the local environment
  //   overrideProcess: false, // Set to true if you want the existing environment variables to be overridden by your .env files
  //   silent: false // Set to true if you want to be notified of any errors that happen when trying to read your .env files
  // });

/**
 * Create a child
 */
exports.create = function(req, res) {
  var child = new Child(req.body);
  child.birthDate = req.body.birthDate;
  child.monthAge = req.body.monthAge;
  child.weight = req.body.weight;
  child.height = req.body.height;
  child.firstName = req.body.firstName;
  child.lastName = req.body.lastName;
  child.comments = req.body.comments;
  child.father = req.body.father;
  child.mother = req.body.mother;
  child.branch = req.body.branch;
  child.user = req.user;
  child.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(child);
    }
  });
};

/**
 * Show the current child
 */
exports.read = function(req, res) {
  res.json(req.child);
};

/**
 * Update a child
 */
exports.update = function(req, res) {
  var child = req.child;
  child.birthDate = req.body.birthDate;
  child.monthAge = req.body.monthAge;
  child.weight = req.body.weight;
  child.height = req.body.height;
  child.firstName = req.body.firstName;
  child.lastName = req.body.lastName;
  child.comments = req.body.comments;
  child.father = req.body.father;
  child.mother = req.body.mother;
  child.branch = req.body.branch;
  child.user = req.user;

  child.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(child);
    }
  });
};

exports.getSyncURL = function(req, res) {
  return res.json({ entity: process.env.SYNC_ENTITY, url: process.env.COUCH_URL });
};

exports.getCountryList = function(req, res) {
  request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
      '/country_list/liahona_kids_countries_stakes', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonObj = JSON.parse(body);
      res.json(jsonObj);
    } else {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(error)
      });
    }
  });
};

exports.listDbs = function(req, res) {
  request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
      '/_all_dbs', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonObj = JSON.parse(body);
      res.json(jsonObj);
    } else {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(error)
      });
    }
  });
};
/**
 * Delete an child
 */
exports.delete = function (req, res) {
  var child = req.child;

  child.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(child);
    }
  });
};

/**
 * List of Children
 */
exports.list = function (req, res) {
  Child.find().sort('-created').populate('user', 'displayName').exec(function (err, childs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(childs);
    }
  });
};

/**
 * Child middleware
 */
exports.childByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Child is invalid'
    });
  }

  Child.findById(id).populate('user', 'displayName').exec(function (err, child) {
    if (err) {
      return next(err);
    } else if (!child) {
      return res.status(404).send({
        message: 'No child with that identifier has been found'
      });
    }
    req.child = child;
    next();
  });
};
