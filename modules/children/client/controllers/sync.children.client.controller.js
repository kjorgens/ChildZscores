/**
 * Created by karljorgensen on 1/26/16.
 */
(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenSyncController', ChildrenSyncController);

  ChildrenSyncController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'ChildrenReport', 'Authentication', 'ChildrenGetSync', 'usSpinnerService', 'PouchService'];

  function ChildrenSyncController($rootScope, $scope, $state, $stateParams, ChildrenReport, Authentication, ChildrenGetSync, usSpinnerService, PouchService) {
    var vm = this;
    ChildrenGetSync.get(function(input) {
      vm.syncStuff = input;
    });
    vm.reportToDownload = '';
    vm.reportName = $stateParams.stakeDB + '.csv';
    vm.reportReady = false;
    vm.stakeDB = $stateParams.stakeDB;
    vm.selectedStake = localStorage.getItem('selectedStake');
    vm.selectedCountry = localStorage.getItem('selectedCountry');
    vm.selectedCountryImage = localStorage.getItem('selectedCountryImage');
    // vm.filterSelect = 'All Children';
    vm.authentication = Authentication;

    vm.selectedStake = $stateParams.stakeName;
    //   vm.selectedCountryObject = sessionStorage.getItem('selectedCountryObject');
    vm.createReport = createReport;
    vm.syncUpstream = syncUpstream;
    vm.online = $rootScope.appOnline;
//    vm.find();

    vm.deleteLocalDB = function(dbName) {
      PouchService.destroyDatabase(dbName);
    };

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
      console.log(err);
      // $state.go('sync-error');
    }

    function syncUpstream() {
      vm.startSpin();
      console.log('start sync for ' + vm.stakeDB);
      PouchService.sync('https://' + vm.syncStuff.entity + '@' +
          vm.syncStuff.url + '/' + vm.stakeDB, replicateIn, replicateError, whenDone);
      // PouchService.longSync(vm.stakeDB, 'https://' + vm.syncStuff.entity + '@' +
      //      vm.syncStuff.url + '/' + vm.stakeDB);
    }

    function returnReport(input) {
      vm.stopSpin();
      vm.reportReady = true;
      vm.reportToDownload = '/' + input.message;
      vm.reportName = vm.stakeDB + '.csv';
      vm.reportFileName = { reportName: vm.reportName };
      console.log(input);
    }

    function getError(error) {
      vm.stopSpin();
      console.log(error);
    }
    function createReport(filter, sort) {
      vm.startSpin();
      if (filter === undefined) {
        filter = 'all';
      }
      if (sort === undefined) {
        sort = 'lastName';
      }
      ChildrenReport.get({ stakeDB: vm.stakeDB, filter: filter, sort: sort }, returnReport, getError);
    }
//    createReport();
  }
}());

