(function () {
  'use strict';

  angular
    .module('children.updateviews')
    .factory('ChildrenViews', ChildrenViews);

  ChildrenViews.$inject = ['$resource', 'Authentication'];

  function ChildrenViews($resource, Authentication) {
    var ChildrenViews = $resource('/api/children', {}, {
      update: {
        method: 'GET',
        // headers: { authorization: `JWT ${ Authentication.token || localStorage.getItem('token') }` },
        headers: { authorization: `JWT ${ Authentication.token }` },
        url: '/api/children/updateviews/:stakeDB',
        interceptor: {
          response: response => {
            var result = response.resource;
            result.$status = response.status;
            return result;
          }
        }
      },
      compact: {
        method: 'GET',
        // headers: { authorization: `JWT ${ Authentication.token || localStorage.getItem('token') }` },
        headers: { authorization: `JWT ${ Authentication.token }` },
        url: '/api/children/compactDB/:stakeDB',
        interceptor: {
          response: response => {
            var result = response.resource;
            result.$status = response.status;
            return result;
          }
        }
      }
    });

    angular.extend(ChildrenViews, {
      updateViews: function (params) {
        return this.update(params).$promise;
      },
      compactDB: function(params) {
        return this.compact(params).$promise;
      }
    });

    return ChildrenViews;
  }
}());
