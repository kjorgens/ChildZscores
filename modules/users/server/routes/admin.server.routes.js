'use strict';

/**
 * Module dependencies
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller'),
  passport = require('passport'),
  express = require('express');

module.exports = function (app) {
  // User route registration first. Ref: #713
  var router = express.Router();
//  require('./users.server.routes.js')(app);

  // Set JWT Auth for all Admin Routes
  router.all('*', passport.authenticate('jwt', { session: false }));
  router.route('/')
      .get(adminPolicy.isAllowed, admin.list);
  // Users collection routes
  // app.route('/api/users')
  //  .get(adminPolicy.isAllowed, admin.list);
// Single user routes
  router.route('/:userId')
      .get(adminPolicy.isAllowed, admin.read)
      .put(adminPolicy.isAllowed, admin.update)
      .delete(adminPolicy.isAllowed, admin.delete);

  // Finish by binding the user middleware
  router.param('userId', admin.userByID);

  app.use('/api/admin/users', router);
  // Single user routes
  // app.route('/api/users/:userId')
  //  .get(adminPolicy.isAllowed, admin.read)
  //  .put(adminPolicy.isAllowed, admin.update)
  //  .delete(adminPolicy.isAllowed, admin.delete);

  // Finish by binding the user middleware
  // app.param('userId', admin.userByID);
};
