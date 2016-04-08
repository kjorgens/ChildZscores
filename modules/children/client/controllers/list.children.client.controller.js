/**
 * Created by karljorgensen on 1/26/16.
 */
(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenListController', ChildrenListController);

  ChildrenListController.$inject = ['$rootScope', '$scope', '$state', 'usSpinnerService', 'ModalService', 'ChildrenService', 'PouchService'];

  function ChildrenListController($rootScope, $scope, $state, usSpinnerService, ModalService, ChildrenService, PouchService) {
    var vm = this;
    vm.childInfoString = childInfoString;
    vm.findOne = findOne;
    vm.find = find;
    vm.appIsOffline = !$rootScope.appOnline;
    if (vm.appIsOffline) {
      vm.stakeList = $rootScope.localDbs;
    } else if ($rootScope.remoteDbs) {
      vm.stakeList = $rootScope.remoteDbs;
    } else {
      // vm.stakeList = 'test';
      vm.selectedStake = 'test';
      $rootScope.selectedStake = vm.selectedStake;
    }
    vm.doctored = [{}];
    vm.stakeList.forEach(function(dbName) {
      if (!dbName.startsWith("_")) {
        // var parts = dbName.split('_');
        // var accum = '';
        // var i = 0;
        // for (i; i < parts.length - 1; i++) {
        //   accum = accum + ' ' + parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        // }
        // vm.doctored.push({ stake: accum, country: parts[i] });
        vm.doctored.push(dbName);
      }
    });
    vm.syncUpstream = syncUpstream;
    vm.online = $rootScope.appOnline;
    vm.find();
    var savedName;
    var blinkVar;
//    vm.stakeSelect;
    vm.selectedStake = $rootScope.selectedStake;
    vm.changeStake = changeStake;

    function changeStake() {
      $rootScope.selectedStake = vm.selectedStake;
      vm.selectedStake = vm.selectedStake;
      PouchService.createDatabase(vm.selectedStake);
      PouchService.createIndex('firstName');
      PouchService.createIndex('lastName');
      PouchService.createIndex('owner');
      PouchService.createIndex('surveyDate');
      vm.childList = [];
      vm.find();
      
      $state.go('children.list');
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

    function childInfoString(child) {
      return child.doc.firstName + ' ' + child.doc.lastName + ' --- Birth age: ' + child.doc.monthAge.toFixed(2) + ' months,' +
          '  Z Scores: height/age: ' + child.doc.zScore.ha.toFixed(2) + ' weight/age: ' + child.doc.zScore.wa.toFixed(2) + ' weight/height: ' +
          child.doc.zScore.wl.toFixed(2);
    }

    var getUser = function (childDoc) {
      vm.child = childDoc;
      $state.go('children.view', {
        childId: childDoc._id
      });
    };

    var getError = function (error) {
      vm.getError = error;
    };
    // Find existing Child
    function findOne() {
      //     var something = $stateParams;
      PouchService.get({ childId: vm.childId }, getUser, getError);
    }

    function setChildren(res) {
      $scope.$apply(function() {
        vm.childList = res;
      });
    }

    function listChildrenErrors(error) {
      vm.error = error;
    }
    // Find a list of Children
    function find () {
      return PouchService.queryChildren(setChildren, listChildrenErrors);
    }
    var whenDone = function() {
      find();
      vm.stopSpin();
//      $rootScope.selectedStake = savedName;
      console.log('couchdb sync complete');
    };
    var replicateIn = function (input) {
      vm.repInData = input;
    };

    var replicateError = function (err) {
      vm.repError = err;
    };

    function syncUpstream() {
 //     savedName = $rootScope.selectedStake;
 //     $rootScope.selectedStake = 'Data Sync in Progress';
      vm.startSpin();
      PouchService.sync('https://syncuser:mZ7K3AldcIzO@database.liahonakids.org:5984/' +
          savedName, replicateIn, replicateError, whenDone);
    }
  }
}());

