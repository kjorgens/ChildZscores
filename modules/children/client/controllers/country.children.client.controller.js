(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenCountryController', ChildrenCountryController);

  ChildrenCountryController.$inject = ['$rootScope', '$scope', '$state', '$translate', 'ModalService', 'ChildrenService', 'ChildrenStakes', 'PouchService'];

  function ChildrenCountryController($rootScope, $scope, $state, $translate, ModalService, ChildrenService, ChildrenStakes, PouchService) {
    var vm = this;
    $translate.use($rootScope.SelectedLanguage);
    function storeDbList(input) {
 //     sessionStorage.setItem('liahonaStakesObject', input);
      vm.liahonaStakes = input;
    }
    function returnFromPut(input) {
      console.log(input);
    }
    function handleError(input) {
      console.log(input);
    }

 //    if (navigator.onLine) {
 //      ChildrenStakes.get(function(retVal) {
 // //       sessionStorage.setItem('liahonaStakesObject', retVal);
 //        vm.liahonaStakes = retVal;
 //        PouchService.createCountryDatabase();
 //        PouchService.putStakesLocal(retVal, returnFromPut, handleError);
 //      });
 //    } else {
      // use the last database if it exits
      // $state.go('children.list',{country,stake}
    PouchService.createCountryDatabase();
    PouchService.getCountriesLocal(storeDbList, handleError);
    // }
  }
}());

