(function () {
  'use strict';

  angular
      .module('children.updateviews')
      .factory('ChildrenViews', ChildrenViews);

  ChildrenViews.$inject = ['$resource', '$rootScope'];

  function ChildrenViews($resource, $rootScope) {
    return $resource('api/children/updateviews/:stakeDB');
  }
}());
