(function () {
  'use strict';

  angular
    .module('children')
    .controller('ChildrenCountryController', ChildrenCountryController);

  ChildrenCountryController.$inject = ['$state', '$rootScope', '$translate', 'countryResolve'];

  function ChildrenCountryController($state, $rootScope, $translate, countryResolve) {
    var vm = this;
    vm.liahonaStakes = countryResolve.countries;
    // .map(country => {
    //   country.image = `/${ country.image }`;
    //   return country;
    // });
    vm.featurePromptCount = parseInt(localStorage.getItem('featurePromptCount'), 10) || 0;
    if (vm.featurePromptCount < 3) {
      localStorage.setItem('featurePromptCount', vm.featurePromptCount + 1);
    } else {
      localStorage.setItem('featurePromptCount', '5');
    }

    // vm.refreshCountryList = refreshCountryList;
    vm.onLine = navigator.onLine;
    $translate.use($rootScope.SelectedLanguage);
    //
    // function storeDbList(input) {
    //   vm.liahonaStakes = input.countries;
    // }

    // function returnFromPut(input) {
    //   // vm.liahonaStakes = input.countries;
    // }

    // function handleSaveLocalError(input) {
    //   console.log("error creating country db local");
    // }
    //
    // function handleError(input) {
    //   console.log(input + " attempt to retrieve info remote");
    //   // getStakesDB();
    // }
    vm.countryMenu = function() {
      $state.go('children.countries', { networkFirst: 'true' });
    };

    // function refreshCountryList() {
    //   getStakesDB();
    // }

    // function getStakesDB() {
    //   if (navigator.onLine) {
    //     ChildrenStakes.get(function(retVal) {
    //       vm.liahonaStakes = retVal;
    //       PouchService.createCountryDatabase();
    //       PouchService.putStakesLocal(retVal, returnFromPut, handleSaveLocalError);
    //     });
    //   } else {
    //     PouchService.getCountriesLocal(storeDbList, handleError);
    //   }
    // }
    // getStakesDB();
  }
}());
