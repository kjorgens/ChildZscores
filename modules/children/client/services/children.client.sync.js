(function () {
  'use strict';

  angular
      .module('children.getsync')
      .factory('ChildrenGetSync', ChildrenGetSync);

  ChildrenGetSync.$inject = ['$resource'];

  function ChildrenGetSync($resource) {
    return $resource('api/children/sync');
  }
}());
