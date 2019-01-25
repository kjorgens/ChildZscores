'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  express = require('express'),
  childrenPolicy = require('../policies/children.server.policy'),
  children = require('../controllers/children.server.controller');

module.exports = function (app) {
  var router = new express.Router();

  // sync db routes
  router.route('/sync')
    // .get(childrenPolicy.isAllowed, children.getSyncURL);
    .get(passport.authenticate('jwt', { session: false }), childrenPolicy.isAllowed, children.getSyncURL);

  // create .csv report file
  router.route('/report/:stakeDB/:cCode/:scopeType/:sortField/:language/:csvType')
    // .get(children.createCSVFromDB);
    .get(passport.authenticate('jwt', { session: false }), childrenPolicy.isAllowed, children.createCSVFromDB);

  // retrieve stakes route
  router.route('/stakes')
    .get(children.getCountryList);

  // retrieve countries route
  router.route('/countries')
    .get(children.getCountryList);

  // update status and save
  router.route('/update/:stakeDB/:cCode/:scopeType/:function')
    .get(passport.authenticate('jwt', { session: false }), childrenPolicy.isAllowed, children.updateZscoreStatus);

  // retrieve countries route
  router.route('/upload/:stakeDB')
    .post(passport.authenticate('jwt', { session: false }), children.uploadCsv);

  router.route('/updateviews/:stakeDB')
    .get(passport.authenticate('jwt', { session: false }), children.checkUpdateViews);

  router.route('/compactDB/:stakeDB')
    .get(passport.authenticate('jwt', { session: false }), children.compactDB);

  router.route('/remoteDBList')
    .get(childrenPolicy.isAllowed, children.listDbs);

  app.use('/api/children', router);
};
