(function () {
  'use strict';

  angular
    .module('children')
    .controller('ChildrenSyncController', ChildrenSyncController);

  ChildrenSyncController.$inject = ['$scope', '$rootScope', '$window', '$timeout', '$state', '$stateParams', '$http', 'ChildrenReport', 'FilterService',
    'Authentication', 'ChildrenGetSync', 'usSpinnerService', 'PouchService', 'ModalService', 'ChildrenViews', 'Socket', 'Upload', 'Notification', 'moment'];

  function ChildrenSyncController($scope, $rootScope, $window, $timeout, $state, $stateParams, $http, ChildrenReport, FilterService,
    Authentication, ChildrenGetSync, usSpinnerService, PouchService, ModalService, ChildrenViews, Socket, Upload, Notification, moment) {
    var vm = this;
    vm.countryCode = $stateParams.cCode;
    vm.countryName = $stateParams.countryName;
    vm.user = Authentication.user;
    vm.userIsAdmin = false;
    vm.goBack = goBack;

    if (vm.user === null) {
      reportError('Login required for syncing', 'Please log in', false);
      // $window.history.pushState();
      $state.go('authentication.signin');
    } else {
      vm.user.roles.forEach(function(role) {
        if (role.indexOf('admin') > -1) {
          vm.userIsAdmin = true;
        }
      });
    }

    // $scope.$on('$destroy', function () {
    //   Socket.emit('end');
    //   Socket.close();
    // });

    vm.uploadExcelCsv = uploadExcelCsv;
    vm.cancelUpload = cancelUpload;
    vm.updateViews = updateViews;
    vm.compactDB = compactDB;
    vm.updateStakeChildStatus = updateStakeChildStatus;

    vm.uploader = function (fileToUpload) {

      Upload.upload({
        url: 'api/children/upload/' + $stateParams.stakeDB,
        data: {
          key: fileToUpload
        },
        headers: {
          authorization: 'JWT ' + Authentication.token
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data);
        });
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };

    // Called after the user has successfully uploaded a new csv
    function onSuccessItem(response) {
      // Show success message
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Successfully uploaded csv' });

      // Populate user object
      vm.user = response;
      Authentication.user = response;

      // Reset form
      vm.fileSelected = false;
      vm.progress = 0;
    }

    // Called after the user has failed to upload a new picture
    function onErrorItem(response) {
      vm.fileSelected = false;
      vm.progress = 0;

      // Show error message
      Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Failed to upload csv' });
    }
    // Create file uploader instance
    // vm.uploader = new FileUploader({
    //   url: 'api/children/upload/' + $stateParams.stakeDB,
    //   alias: 'newUploadCsv',
    //   headers: {
    //     Authorization: 'JWT ' + Authentication.token
    //   }
    // });
    // Set file uploader image filter
    // vm.uploader.filters.push({
    //   name: 'csvFilter',
    //   fn: function (item, options) {
    //     var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
    //     return '|csv|'.indexOf(type) !== -1;
    //   }
    // });
    // // Called after the user selected a new file
    // vm.uploader.onAfterAddingFile = function(fileItem) {
    //   vm.fileToUpload = vm.uploader.queue[0].file.name;
    //   if ($window.FileReader) {
    //     var fileReader = new FileReader();
    //
    //     fileReader.readAsDataURL(fileItem._file);
    //
    //     fileReader.onload = function (fileReaderEvent) {
    //       $timeout(function () {
    //         vm.imageURL = fileReaderEvent.target.result;
    //       }, 0);
    //     };
    //   }
    // };
    //
    // // Called after the user has successfully uploaded
    // vm.uploader.onSuccessItem = function(fileItem, response, status, headers) {
    //   // Show success message
    //   vm.success = true;
    // };
    // vm.uploader.onCancelItem = function(fileItem, response, status, headers) {
    //   console.info('onCancelItem', fileItem, response, status, headers);
    // };

    function goBack() {
      if (~vm.screenType.indexOf('nursing')) {
        $state.go('children.listMothers', {
          stakeDB: vm.stakeDB,
          stakeName: vm.selectedStake,
          cCode: vm.countryCode,
          screenType: 'nursing',
          searchFilter: '',
          colorFilter: ''
        });
      } else if (~vm.screenType.indexOf('pregnant')) {
        $state.go('children.listMothers', {
          stakeDB: vm.stakeDB,
          stakeName: vm.selectedStake,
          cCode: vm.countryCode,
          screenType: 'pregnant',
          searchFilter: '',
          colorFilter: ''
        });
      } else {
        $state.go('children.list', {
          stakeDB: vm.stakeDB,
          stakeName: vm.selectedStake,
          cCode: vm.countryCode,
          searchFilter: '',
          colorFilter: '',
          screenType: vm.screenType
        });
      }
    }

    // vm.uploader.onCompleteItem = function(fileItem, response, status, headers) {
    //   if (status !== 200) {
    //     console.log(status + ' ' + response);
    //     vm.reportError('Error uploading to database', response, true);
    //   } else {
    //     console.log(response);
    //   }
    //   // console.info('onComplete', fileItem, response, status, headers);
    //   vm.onComplete = true;
    //   cancelUpload();
    //   vm.stopSpin();
    //   syncUpstream();
    // };
    // // Called after the user has failed to uploaded a new picture
    // vm.uploader.onErrorItem = function(fileItem, response, status, headers) {
    //   // Clear upload buttons
    //   cancelUpload();
    //
    //   // Show error message
    //   vm.error = response.message;
    // };

    // Change user profile picture


    // Cancel the upload process
    function cancelUpload() {
      vm.uploader.clearQueue();
    }

    vm.reportToDownload = '';
    vm.reportName = $stateParams.stakeDB + '.csv';
    vm.reportReady = false;
    vm.stakeDB = $stateParams.stakeDB;
    vm.screenType = $stateParams.screenType;
    //   vm.stakeDB = localStorage.getItem('selectedDBName');
    //   vm.selectedStake = localStorage.getItem('selectedStake');
    vm.selectedStake = $stateParams.stakeName;
    vm.selectedCountry = localStorage.getItem('selectedCountry');
    vm.selectedCountryCode = localStorage.getItem('selectedCountryCode');
    vm.selectedCountryImage = localStorage.getItem('selectedCountryImage');
    // vm.filterSelect = 'All Children';
    vm.authentication = Authentication;

    // vm.selectedStake = $stateParams.stakeName;
    //   vm.selectedCountryObject = sessionStorage.getItem('selectedCountryObject');
    vm.createReport = createReport;
    vm.syncUpstream = syncUpstream;
    vm.online = $rootScope.appOnline;

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
      PouchService.newSyncFrom('https://' + vm.syncStuff.entity + '@'
        + vm.syncStuff.url + '/' + vm.stakeDB, replicateDown, replicateErrorDown, whenDoneDown);
    }

    function whenDoneDown() {
      // find();
      // vm.stopSpin();
      console.log('couchdb sync complete');
      goBack();
      //    $state.go('children.list', { stakeDB: vm.stakeDB, stakeName: vm.selectedStake, searchFilter: '', colorFilter: '' });
    }

    function replicateUp (input) {
      vm.repUpStats = input;
      console.log(JSON.stringify(input));
      vm.repUpData = input;
      PouchService.newSyncFrom('https://' + vm.syncStuff.entity + '@'
        + vm.syncStuff.url + '/' + vm.stakeDB, replicateDown, replicateErrorDown);
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
      ChildrenGetSync.syncDb()
        .then(function(input) {
          vm.syncStuff = input;
          console.log('Ready to sync https://' + vm.syncStuff.url + '/' + vm.stakeDB);
          PouchService.newSyncTo('https://' + vm.syncStuff.entity + '@'
            + vm.syncStuff.url + '/' + vm.stakeDB, replicateUp, replicateErrorUp);
        });
    }

    function returnReport(input) {
      console.log(`${ input.message } received from server`);
      if (input.$status !== 202) {
        Notification.error({ message: `<i class="glyphicon glyphicon-remove"></i> ${ input.message }` });
      }

      // vm.stopSpin();
      // vm.reportReady = true;
      // vm.reportToDownload = '/files/' + input.message;
      // vm.reportName = input.message;
      // vm.reportFileName = { reportName: vm.reportName };
      // Notification.success({ message: vm.reportName, title: '<i class="glyphicon glyphicon-ok"></i> csv ready to download', delay: 10000 });
    }

    function updateComplete() {
      vm.stopSpin();
      syncUpstream();
    }

    // function setupSocket(input) {
    //   if (!Socket.socket) {
    //     Socket.connectNSP({ query: { nsp: input.nsp } });
    //   }
    //
    //   Socket.on('CSV_status', function (message) {
    //     console.log(`just received ${message.text} at the client`);
    //     if (message.type === 'CSV_error') {
    //       Notification.error({message: `<i class="glyphicon glyphicon-remove"></i> ${message.text}`});
    //     } else if (message.type === 'CSV_progress') {
    //       Notification.success({message: `<i class="glyphicon glyphicon-ok"></i> ${message.text}`});
    //     }
    //
    //     if (message.type === 'CSV_complete') {
    //       vm.stopSpin();
    //       vm.reportReady = true;
    //       vm.reportToDownload = '/files/' + message.fileName;
    //       vm.reportName = message.fileName;
    //       vm.reportFileName = { reportName: vm.reportName };
    //       Notification.success({ message: `<i class="glyphicon glyphicon-ok"></i> ${ message.text }`, delay: 10000 });
    //     }
    //   });
    //
    //   Socket.on('connect', (input) => {
    //   });
    //
    //   Socket.on('disconnect', () => {
    //     console.log('removing listener from the client');
    //     Socket.removeListener('CSV_status');
    //   });
    // }

    function genReport(input) {
      const inputValues = input;
      let timeouts = [];
      vm.reportReady = false;

      function requestReceived(input) {
        console.log(`${ input.message } from the server`);

        if (input.$status !== 202) {
          Notification.error({ message: `<i class="glyphicon glyphicon-remove"></i> ${ input.message }` });
        }
      }

      if (!Socket.socket) {
        Socket.connectNSP(input.nsp);
      }

      Socket.on('CSV_status', function (message) {
        console.log(`just received ${ message.text } at the client`);
        if (message.type === 'CSV_error') {
          Notification.error({ message: `<i class="glyphicon glyphicon-remove"></i> ${ message.text }`});
        } else if (message.type === 'CSV_progress') {
          Notification.success({ message: `<i class="glyphicon glyphicon-ok"></i> ${ message.text }`});
        }

        if (message.type === 'CSV_complete') {
          vm.stopSpin();
          vm.reportReady = true;
          vm.reportToDownload = '/files/' + message.fileName;
          vm.reportName = message.fileName;
          vm.reportFileName = { reportName: vm.reportName };
          Notification.success({ message: `<i class="glyphicon glyphicon-ok"></i> ${ message.text }`, delay: 10000 });
          console.log('remove the socket at the client');
          Socket.close();
        }
      });

      Socket.on('connect', () => {
        console.log('client just got connect event, start building report');
        ChildrenReport.buildReport(inputValues)
          .then(requestReceived)
          .catch(err => {
            getCsvError(err);
          });
      });

      Socket.on('disconnect', () => {
        console.log('removing listener from the client');
        Socket.removeListener('CSV_status');
      });
      // Remove the event listener when the controller instance is destroyed
      $scope.$on('$destroy', function () {
        Socket.removeListener('CSV_status');
      });

      var nameSpace = `/${ Authentication.user.firstName }_${ Authentication.user.lastName }_${ moment.now() }`;

      let count = 24;
      function waitingForComplete(count) {
        if (count > 24) {
          Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Timeout waiting for csv completion' });
          return;
        }
        if (vm.reportReady) {
          timeouts.forEach(timeOutWaiting => {
            clearTimeout(timeOutWaiting);
          });
          return;
        }
        timeouts.push(setTimeout(waitingForComplete, 5000, count + 1));
      }

      timeouts.push(setTimeout(waitingForComplete, 5000, count));


      // console.log('about to leave');
    }

    function updateStakeChildStatus(stakeDB, cCode, scopeType, func) {
      vm.startSpin();
      return $http.get('api/children/update/' + stakeDB + '/' + cCode + '/' + scopeType + '/' + func)
        .then(updateComplete);
    }

    function getCsvError(error) {
      vm.stopSpin();
      vm.reportError('CSV creation error', `${ error.status } ${ error.statusText }`, false);
    }

    function createReport(scope, scopeID, sortField, csvType, stakeName) {
      vm.startSpin();
      if (scope === undefined) {
        scope = 'stake';
      }
      if (sortField === undefined) {
        sortField = 'firstName';
      }
      if (stakeName === 'admin') {
        stakeName = vm.selectedStake;
      }
      var reportParams = {
        csvType: csvType,
        stakeDB: vm.stakeDB,
        scopeType: scope,
        cCode: vm.selectedCountryCode,
        sortField: sortField,
        language: $rootScope.SelectedLanguage,
        stakeName: stakeName,
        nsp: `${ Authentication.user.firstName }_${ Authentication.user.lastName }_${ moment.now() }`
      };

      return genReport(reportParams, getCsvError);
    }

    function updateViews() {
      ChildrenViews.updateViews(vm.stakeDB);
    }

    function compactDB() {
      ChildrenViews.compactDB(vm.stakeDB);
    }

    function viewUpdateComplete() {
      console.log('couch view update complete');
      // Clear messages
      vm.success = null;
      vm.error = null;
      vm.onComplete = null;
      // Start upload
      vm.uploader.uploadAll();
    }

    function viewUpdateError(err) {
      vm.stopSpin();
      console.log('couch view update error');
      vm.reportError('couch view update error', err.data.message, true);
    }

    function uploadExcelCsv() {
      vm.startSpin();
      ChildrenViews.updateViews(vm.stakeDB).then(viewUpdateComplete, viewUpdateError);
    }

    function reportError(title, error, notifyKarl) {
      return ModalService.infoModal(title + ' :\n', error + (notifyKarl ? '\n Please contact kjorgens@yahoo.com' : ''));
    }

    vm.reportError = reportError;
  }
}());
