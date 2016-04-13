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

  // children collection routes
  router.route('/stakes')
      .get(childrenPolicy.isAllowed, children.getCountryList);

  router.route('/countries')
      .get(childrenPolicy.isAllowed, children.getCountryList);

  // children collection routes
  router.route('/')
      .get(childrenPolicy.isAllowed, children.list)
      .post(passport.authenticate('jwt', { session: false }), childrenPolicy.isAllowed, children.create);

  // Single child routes
  router.route('/:childId')
      .get(childrenPolicy.isAllowed, children.read)
      .put(passport.authenticate('jwt', { session: false }), childrenPolicy.isAllowed, children.update)
      .delete(passport.authenticate('jwt', { session: false }), childrenPolicy.isAllowed, children.delete);

  // Finish by binding the child middleware
  router.param('childId', children.childByID);

  app.use('/api/children', router);
};

