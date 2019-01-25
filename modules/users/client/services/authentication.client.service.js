(function () {
  'use strict';

  // Authentication service for user variables

  angular
    .module('users.services')
    .factory('Authentication', Authentication);

  Authentication.$inject = ['$window', '$location'];

  function Authentication($window, $location) {

    var auth = {
      user: $window.user,
      token: localStorage.getItem('token') || $location.search().token || null
    };

    return auth;
  }
}());
