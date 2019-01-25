(function () {
  'use strict';

  angular
    .module('children.services')
    .factory('ChildrenService', ChildrenService);

  ChildrenService.$inject = ['$resource'];

  function ChildrenService($resource) {
    return $resource('api/children/:childId', {
      childId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
