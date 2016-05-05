(function () {
  'use strict';

  angular
      .module('children.getsync')
      .factory('ChildrenGetSync', ChildrenGetSync);

  ChildrenGetSync.$inject = ['$resource', '$rootScope'];

  function ChildrenGetSync($resource, $rootScope) {
    return $resource('api/children/sync');
  }
}());
