(function () {
  'use strict';

  angular
      .module('children.updateviews')
      .factory('ChildrenViews', ChildrenViews);

  ChildrenViews.$inject = ['$http'];

  function ChildrenViews($http) {
    var factory = {};
    factory.updateViews = function(stakeDB)
    {
      return $http.get('api/children/updateviews/' + stakeDB);
    };
    return factory;
  }
}());
