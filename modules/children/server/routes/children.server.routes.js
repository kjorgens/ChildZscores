'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  express = require('express'),
  childrenPolicy = require('../policies/children.server.policy'),
  children = require('../controllers/children.server.controller');

module.exports = function (app) {
  var router = express.Router();

  // sync db routes
  router.route('/sync')
      .get(passport.authenticate('jwt', { session: false }), childrenPolicy.isAllowed, children.getSyncURL);

  // create .csv report file
  router.route('/report/:stakeDB/:filter/:sortField')
      .get(passport.authenticate('jwt', { session: false }), childrenPolicy.isAllowed, children.createCSVFromDB);

  // retrieve stakes route
  router.route('/stakes')
      .get(children.getCountryList);

  // retrieve countries route
  router.route('/countries')
      .get(childrenPolicy.isAllowed, children.getCountryList);

  // retrieve countries route
  router.route('/upload')
      .post(children.uploadCsv);

  router.route('/remoteDBList')
      .get(childrenPolicy.isAllowed, children.listDbs);

  app.use('/api/children', router);
};
