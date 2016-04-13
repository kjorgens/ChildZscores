(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenCountryController', ChildrenCountryController);

  ChildrenCountryController.$inject = ['$rootScope', '$scope', '$state', 'ModalService', 'ChildrenService', 'ChildrenStakes', 'PouchService'];

  function ChildrenCountryController($rootScope, $scope, $state, ModalService, ChildrenService, ChildrenStakes, PouchService) {
    var vm = this;
    function storeDbList(input) {
      $rootScope.liahonaStakes = input;
      vm.liahonaStakes = input;
    }
    function handleError(input) {
      console.log(input);
    }

    if ($rootScope.appOnline) {
      ChildrenStakes.get(function(retVal) {
        $rootScope.liahonaStakes = retVal;
        vm.liahonaStakes = retVal;
//        PouchService.saveStakesLocal(retVal, storeDbList, handleError);
      });
    } else {
      PouchService.createCountryDatabase();
      PouchService.getCountriesLocal(storeDbList, handleError);
    }

    // function storeDBStuff(input) {
    //   vm.liahonaStakes = input;
    //   vm.liahonaCountriesObject = input.countries;
    // }
    // function storeDbList(input) {
    //   $rootScope.globalDBList = input;
    // }
    // function handleError(input) {
    //   console.log(input);
    // }
    // if ($rootScope.appOnline) {
    //   ChildrenStakes.get(function(retVal) {
    //     $rootScope.liahonaStakes = retVal;
    //     vm.liahonaStakes = $rootScope.liahonaStakes;
    //     vm.liahonaCountriesObject = $rootScope.liahonaStakes.countries;
    //
    //     PouchService.saveStakesLocal(retVal, storeDbList, handleError);
    //   });
    // } else {
    //   PouchService.getCountriesLocal(storeDBStuff, handleError);
    // }
    //
    // function findCountry(country) {
    //   return country.name === vm.selectedCountry;
    // }
    //
    // function changeCountry() {
    //   vm.selectedCountryObject = vm.liahonaStakes.countries.find(findCountry);
    //   $rootScope.selectedCountryObject = vm.selectedCountryObject;
    //   $state.go('children.stakes', { country: vm.selectedCountryObject });
    // }
  }
}());

