(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$rootScope', '$scope', '$state', 'ChildrenStakes', 'Authentication', 'menuService', 'PouchService'];

  function HeaderController($rootScope, $scope, $state, ChildrenStakes, Authentication, menuService, PouchService) {
    var vm = this;
    vm.appOnLine = $rootScope.appOnline;
    // function storeDbList(input) {
    //   $rootScope.globalDBList = input;
    // }
    // function handleError(input) {
    //   console.log(input);
    // }
    // if ($rootScope.appOnline) {
    //   ChildrenStakes.get(function(retVal) {
    //     $rootScope.liahonaStakes = retVal;
    //     PouchService.saveStakesLocal(retVal, storeDbList, handleError);
    //   });
    // } else {
    //   PouchService.getCountriesLocal(storeDbList, handleError);
    // }
    // vm.selectedStake = $rootScope.selectedStake;
    // vm.selectedCountry = $rootScope.selectedCountry;
    // vm.selectedDB = $rootScope.selectedDBName;
    //
    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());
