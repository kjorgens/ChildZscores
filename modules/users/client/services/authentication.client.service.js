(function () {
  'use strict';

  // Authentication service for user variables

  angular
    .module('users.services')
    .factory('Authentication', Authentication);

  Authentication.$inject = ['$q', '$resource', '$http', '$location', '$window'];

  function Authentication($q, $resource, $http, $location, $window) {
    var readyPromise = $q.defer();

    var service = {
      ready: readyPromise.promise,
      user: null,
      token: null,
      auth: auth,
      login: login,
      signout: signout,
      refresh: refresh
    };

    function auth() {
      return {
        user: $window.user
      };
    }

    function login(user, token) {
      setUser(user);
      setToken(token);
      setHeader();
      readyPromise.resolve(service);
    }

    function setUser(user) {
      service.user = user;
    }

    function setToken(token) {
      service.token = token;
      localStorage.setItem('token', token);
    }

    function signout() {
      localStorage.removeItem('token');
      service.user = null;
      service.token = null;
      $state.go('home', { reload: true });
    }

    function refresh() {
      return $q(function(resolve, reject) {
        readyPromise = $q.defer();
        $resource('api/users/me').get().$promise
          .then(function (user) {
            setUser(user);
            readyPromise.resolve(service);
            resolve(service);
          });
      });

    }

    function setHeader() {
      $http.defaults.headers.common.Authorization = 'JWT ' + service.token;
    }

    function init() {
      service.token = localStorage.getItem('token') || $location.search().token || null;

      // Remove token from URL
      $location.search('token', null);

      if (service.token) {
        setHeader();
        refresh();
      } else {
        readyPromise.resolve(service);
      }
    }

    // Run init
    init();

    return service;
  }
}());
