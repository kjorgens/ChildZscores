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
      resources: '/view/:childId',
      permissions: '*'
    }, {
      resources: '/sync',
      permissions: '*'
    }, {
      resources: '/remoteDBList',
      permissions: '*'
    }, {
      resources: '/upload/:stakeDB',
      permissions: '*'
    }, {
      resources: '/updateviews/:stakeDB',
      permissions: '*'
    }, {
      resources: '/compactDB/:stakeDB',
      permissions: '*'
    }, {
      resources: '/stakes',
      permissions: ['get']
    }, {
      resources: '/report/:stakeDB/:cCode/:scopeType/:sortField/:language/:csvType',
      permissions: ['*']
    }, {
      resources: '/update/:stakeDB/:cCode/:scopeType/:function',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/',
      permissions: ['get', 'post']
    }, {
      resources: '/view/:childId',
      permissions: ['get']
    }, {
      resources: '/create/:ward',
      permissions: ['get', 'post']
    }, {
      resources: '/edit/:childId',
      permissions: ['get', 'post']
    }, {
      resources: '/survey/:childId/:surveyId',
      permissions: ['get', 'post']
    }, {
      resources: '/stakes',
      permissions: ['get']
    }, {
      resources: '/countries/:networkFirst',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/',
      permissions: ['get']
    }, {
      resources: '/stakes',
      permissions: ['get']
    }, {
      resources: '/countries/:networkFirst',
      permissions: ['get']
    }, {
      resources: '/:childId',
      permissions: ['get']
    }]
  }, {
    roles: ['sync'],
    allows: [{
      resources: '/',
      permissions: ['get']
    }, {
      resources: '/remoteDBlist',
      permissions: '*'
    }, {
      resources: '/stakes',
      permissions: ['get']
    }, {
      resources: '/:childId',
      permissions: ['get']
    }, {
      resources: '/sync',
      permissions: ['get']
    }, {
      resources: '/report/:stakeDB/:cCode/:scopeType/:sortField/:language/:csvType',
      permissions: ['get']
    },
    {
      resources: '/files/:csvFile',
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
