(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenCountryController', ChildrenCountryController);

  ChildrenCountryController.$inject = ['$rootScope', '$scope', '$state', '$translate', 'ModalService', 'ChildrenService', 'ChildrenStakes', 'PouchService'];

  function ChildrenCountryController($rootScope, $scope, $state, $translate, ModalService, ChildrenService, ChildrenStakes, PouchService) {
    var vm = this;
    vm.refreshCountryList = refreshCountryList;
    vm.onLine = navigator.onLine;
    $translate.use($rootScope.SelectedLanguage);
    function storeDbList(input) {
      vm.liahonaStakes = input;
      vm.stopSpin();
    }
    function returnFromPut(input) {
      console.log(input);
    }
    function handleError(input) {
      console.log(input);
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
    function refreshCountryList(){
      vm.startSpin();
      ChildrenStakes.get(function(retVal) {
        vm.liahonaStakes = retVal;
        PouchService.createCountryDatabase();
        PouchService.putStakesLocal(retVal, returnFromPut, handleError);
      });
    }
  
    if (navigator.onLine) {
      ChildrenStakes.get(function(retVal) {
        vm.liahonaStakes = retVal;
        PouchService.createCountryDatabase();
        PouchService.putStakesLocal(retVal, returnFromPut, handleError);
      });
    } else {
      // use the last database if it exits
      // $state.go('children.list',{country,stake}
      PouchService.createCountryDatabase();
      PouchService.getCountriesLocal(storeDbList, handleError);
    }
  }
}());

