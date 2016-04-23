(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenStakeController', ChildrenStakeController);

  ChildrenStakeController.$inject = ['$rootScope', '$scope', 'ChildrenStakes', '$stateParams', 'PouchService'];

  function ChildrenStakeController($rootScope, $scope, ChildrenStakes, $stateParams, PouchService) {
    var vm = this;

    function findCountry(country) {
      return country.name === $stateParams.country;
    }

//    vm.liahonaStakes = sessionStorage.getItem ('liahonaStakesObject');


    function storeDbList(input) {
      //     sessionStorage.setItem('liahonaStakesObject', input);
      vm.liahonaStakes = input;
      vm.selectedCountry = vm.liahonaStakes.countries.find(findCountry);
      localStorage.setItem(vm.selectedCountry, 'selectedCountry');
      sessionStorage.setItem('selectedCountry', vm.selectedCountry.name);
      localStorage.setItem('selectedCountry', vm.selectedCountry.name);
      sessionStorage.getItem('selectedCountryImage', vm.selectedCountry.image);
      localStorage.setItem('selectedCountryImage', vm.selectedCountry.image);
    }

    function handleError(input) {
      console.log(input);
    }

    if ($rootScope.appOnline) {
      ChildrenStakes.get(function (retVal) {
        //       sessionStorage.setItem('liahonaStakesObject', retVal);
        storeDbList(retVal);
 //       vm.liahonaStakes = retVal;
//        PouchService.saveStakesLocal(retVal, storeDbList, handleError);
      });
    } else {
      PouchService.createCountryDatabase();
      PouchService.getCountriesLocal(storeDbList, handleError);
    }
  }
}());

