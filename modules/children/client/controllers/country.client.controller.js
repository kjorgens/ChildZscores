/**
 * Created by karljorgensen on 1/26/16.
 */
(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenCountryController', ChildrenCountryController);

  ChildrenCountryController.$inject = ['$rootScope', '$scope', '$state', 'ModalService', 'ChildrenService', 'PouchService'];

  function ChildrenCountryController($rootScope, $scope, $state, ModalService, ChildrenService, PouchService) {
    var vm = this;
    vm.remoteDbInfo = [{}];
    if ($rootScope.remoteDbs) {
      $rootScope.remoteDbs.forEach(function(dbName) {
        if (!dbName.startsWith("_")) {
          var parts = dbName.split('_');
          var accum;
          var i = 0;
          for (i; i < parts.length; i++) {
            accum = parts[i].charAt(0).toUpperCase() + parts.slice(1);
          }
          vm.remoteDbInfo.push({ stake: accum, country: parts[i] });
        }
      });
    }

    vm.selectedStake = $rootScope.selectedStake;
    vm.changeStake = changeStake;

    function changeStake() {
      if (vm.selectedStake.indexOf('delete') !== -1) {
        var parts = vm.selectedStake.split(':');
        PouchService.destroyDatabase('delete:Cottage');
        return;
      }
      $rootScope.selectedStake = vm.selectedStake;
      PouchService.createDatabase(vm.selectedStake);
      vm.selectedStake = 'Change Stake';
      $state.go('children.list');
      vm.find();
    }
  }
}());

