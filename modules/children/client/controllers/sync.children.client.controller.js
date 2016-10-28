/**
 * Created by karljorgensen on 1/26/16.
 */
(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenSyncController', ChildrenSyncController);

  ChildrenSyncController.$inject = ['$rootScope', '$window', '$timeout', '$scope', '$state', '$stateParams', 'ChildrenReport',
    'Authentication', 'ChildrenGetSync', 'usSpinnerService', 'PouchService', 'FileUploader', 'ModalService'];

  function ChildrenSyncController($rootScope, $window, $timeout, $scope, $state, $stateParams, ChildrenReport,
    Authentication, ChildrenGetSync, usSpinnerService, PouchService, FileUploader, ModalService) {
    var vm = this;
    vm.user = Authentication.user;
    vm.userIsAdmin = false;
    vm.user.roles.forEach(function(role){
      if (role.indexOf('admin') > -1){
        vm.userIsAdmin = true;
      }
    });
    vm.uploadExcelCsv = uploadExcelCsv;
    vm.cancelUpload = cancelUpload;
    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/children/upload/' + $stateParams.stakeDB,
      alias: 'newUploadCsv',
      headers: {
        Authorization: 'JWT ' + Authentication.token
      }
    });
    // Set file uploader image filter
    vm.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|csv|'.indexOf(type) !== -1;
      }
    });
    // Called after the user selected a new file
    vm.uploader.onAfterAddingFile = function(fileItem) {
      vm.fileToUpload = vm.uploader.queue[0].file.name;
      if ($window.FileReader) {
        var fileReader = new FileReader();

        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded
    vm.uploader.onSuccessItem = function(fileItem, response, status, headers) {
      // Show success message
      vm.success = true;

      // Populate user object
//      vm.user = Authentication.user = response;

      // Clear upload buttons
 //     cancelUpload();
 //     vm.syncUpstream();
    };
    vm.uploader.onCancelItem = function(fileItem, response, status, headers) {
      console.info('onCancelItem', fileItem, response, status, headers);
    };

    vm.uploader.onCompleteItem = function(fileItem, response, status, headers) {
      if(status !== 200){
        console.log(status + ' ' + response);
        vm.reportError('Error uploading to database', response, true);
      } else {
        console.log(response);
      }
 //     console.info('onComplete', fileItem, response, status, headers);
      vm.onComplete = true;
      cancelUpload();
      vm.stopSpin();
 //     vm.syncUpstream();
    };
    // Called after the user has failed to uploaded a new picture
    vm.uploader.onErrorItem = function(fileItem, response, status, headers) {
      // Clear upload buttons
      cancelUpload();

      // Show error message
      vm.error = response.message;
    }

    // Change user profile picture
    function uploadExcelCsv() {
      // Clear messages
      vm.success = vm.error = null;
      vm.onComplete = null;
      // Start upload
      vm.startSpin();
      vm.uploader.uploadAll();
    }

    // Cancel the upload process
    function cancelUpload() {
      vm.uploader.clearQueue();
    }

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

    function whenDoneUp() {
      PouchService.newSyncFrom('https://' + vm.syncStuff.entity + '@' +
          vm.syncStuff.url + '/' + vm.stakeDB, replicateDown, replicateErrorDown, whenDoneDown);
    }

    function whenDoneDown() {
      find();
      vm.stopSpin();
      console.log('couchdb sync complete');
      $state.go('children.list', { stakeDB: vm.stakeDB, stakeName: vm.selectedStake });
    }

    function replicateUp (input) {
      vm.repUpStats = input;
      console.log(JSON.stringify(input));
      vm.repUpData = input;
      PouchService.newSyncFrom('https://' + vm.syncStuff.entity + '@' +
          vm.syncStuff.url + '/' + vm.stakeDB, replicateDown, replicateErrorDown);
    }

    function replicateDown (input) {
      vm.repDownStats = input;
      console.log(JSON.stringify(input));
      vm.repDownData = input;
      whenDoneDown();
    }

    function replicateErrorUp(err) {
      vm.repError = err;
      vm.stopSpin();
      console.log('There was an error');
      console.log(err.message);
      vm.reportError('Replication Error Sync up', err.message, true);
    }

    function replicateErrorDown(err) {
      vm.repError = err;
      vm.stopSpin();
      console.log('There was an error');
      console.log(err.message);
      vm.reportError('Replication Error Sync Down', err.message, true);
    }

    function syncUpstream() {
      vm.startSpin();
      console.log('start sync for ' + vm.stakeDB);
      ChildrenGetSync.get(function(input) {
        vm.syncStuff = input;
        console.log('Ready to sync https://' + vm.syncStuff.url + '/' + vm.stakeDB);
        PouchService.newSyncTo('https://' + vm.syncStuff.entity + '@' +
          vm.syncStuff.url + '/' + vm.stakeDB, replicateUp, replicateErrorUp);
      });
    }

    function returnReport(input) {
      vm.stopSpin();
      vm.reportReady = true;
      vm.reportToDownload = '/' + input.message;
      vm.reportName = vm.stakeDB + '.csv';
      vm.reportFileName = { reportName: vm.reportName };
      console.log(input);
    }

    function getCsvError(error) {
      vm.stopSpin();
      console.log(error.data.message);
      vm.reportError('CSV creation error', error.data.name + ' >>> ' + error.data.message, true);
//      return ModalService.infoModal('some dumb error' + ' :\n', error + (notifyKarl ? '\n Please contact kjorgens@yahoo.com' : ''));
//      vm.reportError('Download csv error', error.data.error.message, error.data.error.name.indexOf('Empty database') < 0);
    }
    function createReport(filter, sortField) {
      vm.startSpin();
      if (filter === undefined) {
        filter = 'all';
      }
      if (sortField === undefined) {
        sortField = 'lastName';
      }
      ChildrenReport.get({ stakeDB: vm.stakeDB, filter: filter, sortField: sortField }, returnReport, getCsvError);
    }

    vm.reportError = function (title, error, notifyKarl) {
      return ModalService.infoModal(title + ' :\n', error + (notifyKarl ? '\n Please contact kjorgens@yahoo.com' : ''));
    };
//    createReport();
  }
}());

