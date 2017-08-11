(function () {
  'use strict';

  angular
      .module('children.stakes')
      .factory('ChildrenStakes', ChildrenStakes);

  ChildrenStakes.$inject = ['$resource'];

  function ChildrenStakes($resource) {
    return $resource('api/children/stakes');
  }
}());
