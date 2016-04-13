(function () {
  'use strict';

  angular
      .module('children.stakes')
      .factory('ChildrenStakes', ChildrenStakes);

  ChildrenStakes.$inject = ['$resource', '$rootScope'];

  function ChildrenStakes($resource, $rootScope) {
    return $resource('api/children/stakes');
  }
}());
