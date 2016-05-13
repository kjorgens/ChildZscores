(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenCountryController', ChildrenCountryController);

  ChildrenCountryController.$inject = ['$rootScope', '$scope', '$state', '$translate', 'usSpinnerService', 'ModalService', 'ChildrenService', 'ChildrenStakes', 'PouchService'];

  function ChildrenCountryController($rootScope, $scope, $state, $translate, usSpinnerService, ModalService, ChildrenService, ChildrenStakes, PouchService) {
    var vm = this;
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
    function handleError(input) {
      console.log (input + ' attempt to retrieve info remote');
      getStakesDB ();
      vm.stopSpin ();
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
          PouchService.putStakesLocal(retVal, returnFromPut, handleError);
        });
      }
    }
    PouchService.createCountryDatabase();
    PouchService.getCountriesLocal(storeDbList, handleError);
  }
}());

