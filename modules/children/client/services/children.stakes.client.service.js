(function () {
  'use strict';

  angular
    .module('children.stakes')
    .factory('ChildrenStakes', ChildrenStakes);

  ChildrenStakes.$inject = ['$http'];

  function ChildrenStakes($http) {
    var factory = {};
    factory.getStakes = function () {
      return $http.get('api/children/stakes')
        .then(function (results) {
          return results.data.countries;
        });
    };
    return factory;
  }
}());
