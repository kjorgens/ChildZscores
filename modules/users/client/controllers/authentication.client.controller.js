(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', '$http', '$location', '$window', '$stateParams', 'ChildrenStakes', 'Authentication', 'PouchService', 'PasswordValidator'];

  function AuthenticationController($scope, $state, $http, $location, $window, $stateParams, ChildrenStakes, Authentication, PouchService, PasswordValidator) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;

    // Get an eventual error defined in the URL query string:
    vm.error = $location.search().err;

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }
    function returnFromPut(input) {
      console.log(input);
    }

    function handleError(input) {
      console.log(input);
    }

    function populateLocalDB() {
      PouchService.getCountriesList(true);
    }

    function signup(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      $http.post('/api/auth/signup', vm.credentials).then(function (response) {
        // If successful we assign the response to the global user model

        Authentication.login(response.data.user, response.data.token);
        populateLocalDB();
        // And redirect to the previous or home page
        $state.go('home');
 //       $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).catch(function (response) {
        vm.error = response.data.message;
      });
    }

    function signin(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      $http.post('/api/auth/signin', vm.credentials).then(function (response) {
        // If successful we assign the response to the global user model

        Authentication.login(response.data.user, response.data.token);
        localStorage.setItem('lastInterviewer', response.data.user.displayName);
        // And redirect to the previous or home page
        populateLocalDB();
        $window.history.back();
 //       $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).catch(function (response) {
        vm.error = response.data.message;
      });
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }
  }
}());
