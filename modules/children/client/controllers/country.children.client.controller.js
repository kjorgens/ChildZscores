(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenCountryController', ChildrenCountryController);

  ChildrenCountryController.$inject = ['$rootScope', '$scope', '$state', 'ModalService', 'ChildrenService', 'ChildrenStakes', 'PouchService'];

  function ChildrenCountryController($rootScope, $scope, $state, ModalService, ChildrenService, ChildrenStakes, PouchService) {
    var vm = this;
    function storeDbList(input) {
 //     sessionStorage.setItem('liahonaStakesObject', input);
      vm.liahonaStakes = input;
    }
    function handleError(input) {
      console.log(input);
    }

    if ($rootScope.appOnline) {
      ChildrenStakes.get(function(retVal) {
 //       sessionStorage.setItem('liahonaStakesObject', retVal);
        vm.liahonaStakes = retVal;
//        PouchService.saveStakesLocal(retVal, storeDbList, handleError);
      });
    } else {
      PouchService.createCountryDatabase();
      PouchService.getCountriesLocal(storeDbList, handleError);
    }
  }
}());

