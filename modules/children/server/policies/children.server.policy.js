'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Children Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/',
      permissions: '*'
    }, {
      resources: '/:childId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/',
      permissions: ['get', 'post']
    }, {
      resources: '/:childId',
      permissions: ['get']
    },{
      resources: '/children',
      permissions: ['get', 'post']
    }, {
      resources: '/create',
      permissions: ['get','post']
    },{
      resources: '/:childId/edit',
      permissions: ['get', 'post']
    }, {
      resources: '/:childId/survey/:surveyId',
      permissions: ['get', 'post']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/',
      permissions: ['get']
    }, {
      resources: '/:childId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Children Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an child is being processed and the current user created it then allow any manipulation
  if (req.child && req.user && req.child.user && req.child.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
