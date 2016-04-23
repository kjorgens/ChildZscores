/**
 * Created by karljorgensen on 1/26/16.
 */
(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenSyncController', ChildrenSyncController);

  ChildrenSyncController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'childSync', 'usSpinnerService', 'PouchService'];

  function ChildrenSyncController($rootScope, $scope, $state, $stateParams, childSync, usSpinnerService, PouchService) {
    var vm = this;
    vm.stakeDB = $stateParams.stakeDB;
    vm.selectedStake = localStorage.getItem('selectedStake');
    vm.selectedCountry = localStorage.getItem('selectedCountry');
    vm.selectedCountryImage = localStorage.getItem('selectedCountryImage');

    vm.selectedStake = $stateParams.stakeName;
    //   vm.selectedCountryObject = sessionStorage.getItem('selectedCountryObject');

    vm.syncUpstream = syncUpstream;
    vm.online = $rootScope.appOnline;
//    vm.find();

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

    // function childInfoString(child) {
    //   return child.doc.firstName + ' ' + child.doc.lastName + ' --- Birth age: ' + child.doc.monthAge.toFixed(2) + ' months,' +
    //       '  Z Scores: height/age: ' + child.doc.zScore.ha.toFixed(2) + ' weight/age: ' + child.doc.zScore.wa.toFixed(2) + ' weight/height: ' +
    //       child.doc.zScore.wl.toFixed(2);
    // }

    function whenDone() {
      find();
      vm.stopSpin();
      console.log('couchdb sync complete');
      $state.go('children.list', { stakeDB: vm.stakeDB, stakeName: vm.selectedStake });
    }
    function replicateIn (input) {
      vm.repInData = input;
    }

    function replicateError(err) {
      vm.repError = err;
    }

    function syncUpstream() {
      vm.startSpin();
      PouchService.sync('https://syncuser:mZ7K3AldcIzO@database.liahonakids.org:5984/' +
          vm.stakeDB, replicateIn, replicateError, whenDone);
    }
  }
}());

