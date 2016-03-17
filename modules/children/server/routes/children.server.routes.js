'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  express = require('express'),
  childrenPolicy = require('../policies/children.server.policy'),
  children = require('../controllers/children.server.controller');


module.exports = function (app) {
  var router = express.Router ();


  // children collection routes
  router.route('/')
      .get(children.list)
      .post( childrenPolicy.isAllowed, children.create);

  // Single child routes
  router.route('/:childId')
      .get(childrenPolicy.isAllowed, children.read)
      .put(childrenPolicy.isAllowed, children.update)
      .delete( childrenPolicy.isAllowed, children.delete);

  // Finish by binding the child middleware
  router.param('childId', children.childByID);

  app.use('/api/children', router);
};

