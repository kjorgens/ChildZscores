(function () {
  'use strict';

  angular
    .module('children.getsync')
    .factory('ChildrenGetSync', ChildrenGetSync);

  ChildrenGetSync.$inject = ['$resource', 'Authentication'];

  function ChildrenGetSync($resource, Authentication) {
    let ChildrenGetSync = $resource('api/children/sync', {}, {
      generate: {
        method: 'GET',
        // headers: { authorization: `JWT ${ Authentication.token || localStorage.getItem('token') }` },
        url: '/api/children/sync'
      }
    });

    angular.extend(ChildrenGetSync, {
      syncDb: function () {
        return this.generate().$promise;
      }
    });

    return ChildrenGetSync;
  }
}());
