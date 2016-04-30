(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$rootScope', '$scope', '$state', '$window', '$translate', 'ChildrenStakes', 'Authentication', 'menuService', 'PouchService'];

  function HeaderController($rootScope, $scope, $state, $window, $translate, ChildrenStakes, Authentication, menuService, PouchService) {
    var vm = this;
    $rootScope.SelectedLanguage = 'es';
    $translate.use('es');
    vm.language = 'English';
    vm.appStatus = 'test';
    vm.toggleLanguage = toggleLanguage;
    vm.appOnLine = navigator.onLine;
    if (navigator.onLine) {
      vm.appStatus = 'Online';
      vm.onlineStatusColor = 'online';
    } else {
      vm.appStatus = 'Offline';
      vm.onlineStatusColor = 'offline';
    }
    $window.addEventListener('offline', function () {
      $scope.$apply(function() {
        vm.appOnLine = false;
        vm.appStatus = 'Offline';
        vm.onlineStatusColor = 'offline';
      });
    }, false);
    $window.addEventListener('online', function () {
      $scope.$apply(function() {
        vm.appOnLine = true;
        vm.appStatus = 'Online';
        vm.onlineStatusColor = 'online';
      });
    }, false);

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function toggleLanguage() {
      if (vm.language === 'English') {
        vm.language = 'Español';
        $translate.use('en');
        $rootScope.SelectedLanguage = 'en';
      } else {
        vm.language = 'English';
        $translate.use('es');
        $rootScope.SelectedLanguage = 'es';
      }
    }
    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());
