(function () {
  'use strict';

  angular
    .module('children.stakes')
    .factory('ChildrenStakes', ChildrenStakes);

  ChildrenStakes.$inject = ['$resource'];

  function ChildrenStakes($resource) {
    var ChildrenStakes = $resource('/api/children', {}, {
      getStakesRemote: {
        method: 'GET',
        url: '/api/children/stakes'
      }
    });

    angular.extend(ChildrenStakes, {
      getStakes: function () {
        return this.getStakesRemote().$promise;
      }
    });

    return ChildrenStakes;
  }
}());
