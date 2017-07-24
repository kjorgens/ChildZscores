(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenCountryController', ChildrenCountryController);

  ChildrenCountryController.$inject = ['$rootScope', '$translate', 'usSpinnerService', 'ChildrenStakes', 'PouchService'];

  function ChildrenCountryController($rootScope, $translate, usSpinnerService, ChildrenStakes, PouchService) {
    var vm = this;

    vm.featurePromptCount = parseInt(localStorage.getItem('featurePromptCount')) || 0;
    if(vm.featurePromptCount < 3){
      localStorage.setItem('featurePromptCount',vm.featurePromptCount+1);
    } else {
      localStorage.setItem('featurePromptCount',"5");
    }

    vm.refreshCountryList = refreshCountryList;
    vm.onLine = navigator.onLine;
    $translate.use($rootScope.SelectedLanguage);
    function storeDbList(input) {
      vm.liahonaStakes = input;
      vm.stopSpin();
    }
    function returnFromPut(input) {
      vm.stopSpin();
      console.log(input);
    }

    function handleSaveLocalError(input) {
      vm.stopSpin();
      console.log("error creating country db local");
    }

    function handleError(input) {
      console.log(input + " attempt to retrieve info remote");
      getStakesDB();
      vm.stopSpin();
    }
    vm.startSpin = function() {
      if (!vm.spinneractive) {
        usSpinnerService.spin('spinner-sync');
      }
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
    function refreshCountryList() {
      vm.startSpin();
      getStakesDB();
    }

    function getStakesDB() {
      if (navigator.onLine) {
        ChildrenStakes.get(function(retVal) {
          vm.liahonaStakes = retVal;
          PouchService.createCountryDatabase();
          PouchService.putStakesLocal(retVal, returnFromPut, handleSaveLocalError);
        });
      }
    }
    PouchService.createCountryDatabase();
    PouchService.getCountriesLocal(storeDbList, handleError);
  }
}());

