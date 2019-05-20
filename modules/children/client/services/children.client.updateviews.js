(function () {
  'use strict';

  angular
    .module('children.updateviews')
    .factory('ChildrenViews', ChildrenViews);

  ChildrenViews.$inject = ['$resource', 'Authentication'];

  function ChildrenViews($resource, Authentication) {
    let ChildrenViews = $resource('/api/children/updateviews', {}, {
      updateTheViews: {
        method: 'GET',
        headers: { authorization: `JWT ${ Authentication.token || localStorage.getItem('token') }` },
        url: '/api/children/updateviews/:stakeDB'
      }
    });

    angular.extend(ChildrenViews, {
      updateViews: function (params) {
        return this.updateTheViews(params).$promise;
      }
    });

    return ChildrenViews;
  }
}());
