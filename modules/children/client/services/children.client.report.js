(function () {
  'use strict';

  angular
      .module('children.report')
      .factory('ChildrenReport', ChildrenReport);

  ChildrenReport.$inject = ['$resource', '$rootScope'];

  function ChildrenReport($resource, $rootScope) {
    return $resource('api/children/report/:stakeDB/:filter/:sortField');
  }
}());
