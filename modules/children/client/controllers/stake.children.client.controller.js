(function () {
  'use strict';

  angular
    .module('children')
    .controller('ChildrenStakeController', ChildrenStakeController);

  ChildrenStakeController.$inject = ['$rootScope', '$state', '$translate', 'FilterService', 'usSpinnerService',
    'countryData', '$stateParams'];

  function ChildrenStakeController($rootScope, $state, $translate, FilterService, usSpinnerService,
    countryData, $stateParams) {
    var vm = this;
    vm.selectedCountry = countryData;
    sessionStorage.setItem('selectedCountry', vm.selectedCountry.name);
    localStorage.setItem('selectedCountry', vm.selectedCountry.name);
    localStorage.setItem('selectecCountryCode', vm.selectedCountry.code);
    localStorage.setItem('childFilter', 'a');
    FilterService.setColorFilter('');
    FilterService.setSearchFilter('');
    // vm.refreshCountryList = refreshCountryList;
    vm.screenPregnantWomen = screenPregnantWomen;
    vm.screenNursingMothers = screenNursingMothers;
    vm.screenChildren = screenChildren;
    vm.onLine = navigator.onLine;
    $translate.use($rootScope.SelectedLanguage);
    function findCountry(country) {
      return country.name === $stateParams.country;
    }
    // function returnFromPut(input) {
    //   vm.stopSpin();
    //   console.log(input);
    // }
    function handleError(input) {
      console.log(input + ' attempt to retrieve info remote');
      // getStakesDB();
      vm.stopSpin();
    }
    vm.startSpin = function() {
      if (!vm.spinneractive) {
        usSpinnerService.spin('spinner-sync');
      }
    };

    vm.countryList = function() {
      $state.go('children.countries', { networkFirst: 'true' });
    };

    vm.stopSpin = function() {
      if (vm.spinneractive) {
        usSpinnerService.stop('spinner-sync');
      }
    };
    vm.spinneractive = false;

    $rootScope.$on('us-spinner:spin', function(event, key) {
      vm.spinneractive = true;
    });

    $rootScope.$on('us-spinner:stop', function(event, key) {
      vm.spinneractive = false;
    });
    // function refreshCountryList() {
    //   vm.startSpin();
    //   ChildrenStakes.get(function(retVal) {
    //     vm.liahonaStakes = retVal;
    //     PouchService.createCountryDatabase();
    //     PouchService.putStakesLocal(retVal, returnFromPut, handleError);
    //   });
    // }
    function storeDbList(input) {
          // sessionStorage.setItem('liahonaStakesObject', input);
      vm.liahonaStakes = input;
      vm.selectedCountry = vm.liahonaStakes.countries.find(findCountry);
      // localStorage.setItem(vm.selectedCountry, 'selectedCountry');
      sessionStorage.setItem('selectedCountry', vm.selectedCountry.name);
      localStorage.setItem('selectedCountry', vm.selectedCountry.name);
      localStorage.setItem('selectecCountryCode', vm.selectedCountry.code);
      sessionStorage.setItem('selectecCountryCode', vm.selectedCountry.code);
      sessionStorage.getItem('selectedCountryImage', vm.selectedCountry.image);
      localStorage.setItem('selectedCountryImage', vm.selectedCountry.image);
    }

    function screenChildren(stakeName, stakeDB) {
      vm.startSpin();
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      $state.go('children.list', { countryName: vm.selectedCountry.name, countryCode: vm.selectedCountry.code, stakeDB: stakeDB, stakeName: stakeName, searchFilter: '', colorFilter: '', screenType: 'children' });
    }

    function screenPregnantWomen(stakeName, stakeDB) {
      vm.startSpin();
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      $state.go('children.listMothers', { stakeDB: stakeDB, stakeName: stakeName, searchFilter: '', colorFilter: '', screenType: 'pregnant' });
    }

    function screenNursingMothers(stakeName, stakeDB) {
      vm.startSpin();
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      $state.go('children.listMothers', { stakeDB: stakeDB, stakeName: stakeName, searchFilter: '', colorFilter: '', screenType: 'nursing' });
    }

    // function getStakesDB() {
    //   if (navigator.onLine) {
    //     ChildrenStakes.get(function(retVal) {
    //       vm.liahonaStakes = retVal;
    //       PouchService.createCountryDatabase();
    //       PouchService.putStakesLocal(retVal, returnFromPut, handleError);
    //     });
    //   }
    // }
    // PouchService.createCountryDatabase();
    // PouchService.getCountriesLocal(storeDbList, handleError);
  }
}());

