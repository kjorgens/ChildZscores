(function () {
  'use strict';

  angular
    .module('children.report')
    .factory('ChildrenReport', ChildrenReport);

  ChildrenReport.$inject = ['$resource', 'Authentication'];

  function ChildrenReport($resource, Authentication) {
    var ChildrenReport = $resource('/api/children', {}, {
      generate: {
        method: 'GET',
        headers: { authorization: `JWT ${ Authentication.token || localStorage.getItem('token') }` },
        // headers: { authorization: `JWT ${ Authentication.token }` },
        url: '/api/children/report/:stakeDB/:cCode/:scopeType/:sortField/:language/:csvType',
        interceptor: {
          response: response => {
            var result = response.resource;
            result.$status = response.status;
            return result;
          }
        }
      },
      convert: {
        method: 'GET',
        headers: { authorization: `JWT ${ Authentication.token || localStorage.getItem('token') }` },
        // headers: { authorization: `JWT ${ Authentication.token }` },
        url: '/api/children/update/:stakeDB/:stakeName/:cCode/:scopeType',
        interceptor: {
          response: response => {
            var result = response.resource;
            result.$status = response.status;
            return result;
          }
        }
      }
    });

    angular.extend(ChildrenReport, {
      buildReport: function (params) {
        return this.generate(params).$promise;
      },
      convertZscores: function (params) {
        return this.convert(params).$promise;
      }
    });

    return ChildrenReport;
  }
}());
