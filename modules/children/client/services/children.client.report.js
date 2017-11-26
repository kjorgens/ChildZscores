(function () {
  'use strict';

  angular
      .module('children.report')
      .factory('ChildrenReport', ChildrenReport);

  ChildrenReport.$inject = ['$resource'];

  function ChildrenReport($resource) {
    return $resource('api/children/report/:stakeDB/:filter/:sortField/:language');
  }
}());
