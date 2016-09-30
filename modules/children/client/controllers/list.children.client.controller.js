/**
 * Created by karljorgensen on 1/26/16.
 */
(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenListController', ChildrenListController);

  ChildrenListController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$window', '$translate', 'childResolve', 'usSpinnerService', 'PouchService'];

  function ChildrenListController($rootScope, $scope, $state, $stateParams, $window, $translate, childResolve, usSpinnerService, PouchService) {
    var vm = this;
    $translate.use($rootScope.SelectedLanguage);
    vm.childList = childResolve;

    sessionStorage.setItem('selectedStake', $stateParams.stakeName);
 //   localStorage.setItem('selectedWard','All Wards');
    sessionStorage.setItem('selectedDBName', $stateParams.stakeDB);
    localStorage.setItem('selectedStake', $stateParams.stakeName);
    localStorage.setItem('selectedDBName', $stateParams.stakeDB);

    vm.selectedStake = $stateParams.stakeName;
    vm.selectedStakeDB = $stateParams.stakeDB;
 //   vm.selectedWard = 'All Wards';
    getWardList();

    function performTranslation() {
      $translate(['BOY', 'GIRL', 'ACUTE_ZSCORE', 'MICRO_NUTRITION_ZSCORE', 'AT_RISK_ZSCORE', 'NORMAL_ZSCORE'])
        .then(function (translations) {
          vm.boy = translations.BOY;
          vm.girl = translations.GIRL;
          vm.zscoreAcute = translations.ACUTE_ZSCORE;
          vm.zscoreMicro = translations.MICRO_NUTRITION_ZSCORE;
          vm.zscoreAtRisk = translations.AT_RISK_ZSCORE;
          vm.zscoreNormal = translations.NORMAL_ZSCORE;
        });
    }
    performTranslation();

    vm.onLine = navigator.onLine;
    vm.find = find;
    vm.selectWard = selectWard;
    vm.find();
    $rootScope.$on('$translateChangeSuccess', function () {
      performTranslation();
    });
    // $translate.use('es');
    $window.addEventListener('offline', function () {
      $scope.$apply(function() {
        vm.onLine = false;
        vm.appStatus = 'Offline';
        vm.onlineStatusColor = 'offline';
      });
    }, false);
    $window.addEventListener('online', function () {
      $scope.$apply(function() {
        vm.onLine = true;
        vm.appStatus = 'Online';
        vm.onlineStatusColor = 'online';
      });
    }, false);

    vm.selectedCountry = sessionStorage.getItem('selectedCountry');
    vm.selectedCountryImage = sessionStorage.getItem('selectedCountryImage');

    function childInfoString(child) {
      return child.doc.firstName + ' ' + child.doc.lastName + ' --- Birth age: ' + child.doc.monthAge.toFixed(2) + ' months,' +
          '  Z Scores: height/age: ' + child.doc.zScore.ha.toFixed(2) + ' weight/age: ' + child.doc.zScore.wa.toFixed(2) + ' weight/height: ' +
          child.doc.zScore.wl.toFixed(2);
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

    function setChildren(res) {
      $scope.$apply(function() {
        vm.childList = res;
        vm.stopSpin();
      });
    }
    function storeStuff(input) {
      if (input !== null) {
        vm.wardList = input;
        // vm.wardList.push({ wardName: 'All Wards'} );
        // vm.selectedWard = vm.wardList[8].wardName;
      }
    }

    function listChildrenErrors(error) {
      vm.error = error;
      console.log(error);
      vm.stopSpin();
    }

    // Find a list of Children
    function find () {
      return PouchService.queryChildren(setChildren, listChildrenErrors);
    }

    function selectWard() {
       // vm.selectedWard = vm.selectedWard;
      if (vm.selectedWard === undefined) {
      // if(vm.selectedWard.wardName.indexOf('All Wards') > -1){
        return PouchService.queryChildren(setChildren, listChildrenErrors);
      } else {
        localStorage.setItem('selectedWard', vm.selectedWard.wardName);
        return PouchService.queryByWard(vm.selectedWard.wardName, setChildren, listChildrenErrors);
      }
    }

    function getWardList() {
      return PouchService.getWardList(localStorage.getItem('selectedCountry'), vm.selectedStake, storeStuff, listChildrenErrors);
    }
  }
}());

