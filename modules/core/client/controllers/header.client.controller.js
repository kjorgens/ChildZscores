(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$rootScope', '$scope', '$state', '$window', '$translate', 'moment', 'Authentication', 'menuService'];

  function HeaderController($rootScope, $scope, $state, $window, $translate, moment, Authentication, menuService) {
    var vm = this;

    vm.browserVersion = window.navigator.userAgent;

    if (window.navigator.userAgent.indexOf('Chrome') === -1) {
      $state.go('chrome-only');
    } else if (window.navigator.userAgent.indexOf('Android') > -1 && parseInt(window.navigator.userAgent.split('Chrome/')[1].split('.')[0], 10) < 43) {
      $state.go('chrome-only');
    }
    vm.languageCode = localStorage.getItem('selectedLanguage');
    if (vm.language === undefined) {
      // default to english for now
      $rootScope.SelectedLanguage = 'en';
      moment.locale('en');
      $translate.use('en');
      vm.language = 'Español';
    } else {
      if (vm.languageCode.indexof('en') > -1) {
        $rootScope.SelectedLanguage = 'en';
        moment.locale('en');
        $translate.use('en');
        vm.language = 'Español';
      } else {
        $rootScope.SelectedLanguage = 'es';
        moment.locale('es');
        $translate.use('es');
        vm.language = 'English';
      }
    }
    vm.selectedStake = localStorage.getItem('selectedStake');
    vm.selectedDB = localStorage.getItem('selectedDBName');
    if (vm.selectedStake !== undefined) {
      $rootScope.selectedStake = vm.selectedStake;
 //     $state.go('children.list',{ stakeDB: vm.selectedDB, stakeName: vm.selectedStake })
    }
    vm.appStatus = 'test';
    vm.toggleLanguage = toggleLanguage;
    vm.appOnLine = navigator.onLine;

    vm.selectedStake = localStorage.getItem('selectedStake');
    if (vm.selectedStake) {
      $rootScope.stakeName = vm.selectedStake;
    }
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

    vm.countryMenu = function() {
      $state.go('home', { networkFirst: 'true' });
    };

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
