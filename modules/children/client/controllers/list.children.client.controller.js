/**
 * Created by karljorgensen on 1/26/16.
 */
(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenListController', ChildrenListController);

  ChildrenListController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$window', '$translate',
    'FilterService', 'childResolve', 'usSpinnerService', 'PouchService'];

  function ChildrenListController($rootScope, $scope, $state, $stateParams, $window, $translate,
     FilterService, childResolve, usSpinnerService, PouchService) {
    var vm = this;
    vm.countryCode = $stateParams.countryCode;
    vm.countryName = $stateParams.countryName;
    FilterService.setCurrentScreenType($stateParams.screenType);
    vm.screenType = $stateParams.screenType;
    vm.childFilter = localStorage.getItem('childFilter') || 'a';
    vm.searchStarted = searchStarted;
    vm.focusSearch = 1;
    vm.searchString = FilterService.currentListFilter();
    vm.noSelection = FilterService.getCurrentScreenType() === '';
    vm.childList = FilterService.searchAndFilter(childResolve.docs, FilterService.currentListFilter(), FilterService.currentColorFilter(), 'firstName');
    $translate.use($rootScope.SelectedLanguage);

    sessionStorage.setItem('selectedStake', $stateParams.stakeName);
    sessionStorage.setItem('selectedDBName', $stateParams.stakeDB);
    localStorage.setItem('selectedStake', $stateParams.stakeName);
    localStorage.setItem('selectedDBName', $stateParams.stakeDB);
    FilterService.setCurrentChildList(vm.childList);

    vm.selectedStake = $stateParams.stakeName;
    vm.selectedStakeDB = $stateParams.stakeDB;

    function performTranslation() {
      $translate(['BOY', 'GIRL', 'ACUTE_ZSCORE', 'MICRO_NUTRITION_ZSCORE', 'AT_RISK_ZSCORE', 'NORMAL_ZSCORE', 'CHILD_GRADUATED'])
        .then(function (translations) {
          vm.boy = translations.BOY;
          vm.girl = translations.GIRL;
          vm.zscoreAcute = translations.ACUTE_ZSCORE;
          vm.zscoreMicro = translations.MICRO_NUTRITION_ZSCORE;
          vm.zscoreAtRisk = translations.AT_RISK_ZSCORE;
          vm.zscoreNormal = translations.NORMAL_ZSCORE;
          vm.childGraduated = translations.CHILD_GRADUATED;
        });
    }
    performTranslation();

    vm.onLine = navigator.onLine;

    vm.selectWard = selectWard;

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

    vm.clearSearch = function(){
      vm.searchString = '';
      FilterService.searchAndFilter(vm.childList, '', FilterService.currentColorFilter(), 'firstName');
    };

    function searchStarted() {
      vm.childList = FilterService.searchAndFilter(vm.childList, vm.searchString, FilterService.currentColorFilter(), 'firstName');
      if ( FilterService.displayCount() === 1 ){
        FilterService.setSearchFilter(vm.searchString.slice(0, -1));
        vm.focusSearch++;
        $state.go('children.view', { childId: FilterService.getSingleChildId() });
      }
    }

    function checkAge (birthDate) {
      return moment(new Date()).diff(moment(birthDate), 'months');
    }

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

    vm.filterDanger = function() {
      vm.startSpin();
      vm.childList = FilterService.searchAndFilter(vm.childList, FilterService.currentListFilter(), 'redZoneZscore', 'firstName');
      vm.childFilter = 'r';
      localStorage.setItem('childFilter','r');
      vm.stopSpin();
      vm.focusSearch++;
    };

    vm.filterWarning = function() {
      vm.startSpin();
      vm.childList = FilterService.searchAndFilter(vm.childList, FilterService.currentListFilter(), 'marginalZscore', 'firstName');
      vm.childFilter = 'w';
      localStorage.setItem('childFilter','w');
      vm.stopSpin();
      vm.focusSearch++;
    };

    vm.filterSuccess = function() {
      vm.startSpin();
      vm.childList = FilterService.searchAndFilter(vm.childList, FilterService.currentListFilter(), 'normalZscore', 'firstName');
      vm.childFilter = 'n';
      localStorage.setItem('childFilter','n');
      vm.stopSpin();
      vm.focusSearch++;
    };

    vm.filterNone = function() {
      vm.startSpin();
      vm.childList = FilterService.searchAndFilter(vm.childList, FilterService.currentListFilter(), '', 'firstName');
      vm.childFilter = 'a';
      localStorage.setItem('childFilter','a');
      vm.stopSpin();
      vm.focusSearch = true;
    };

    function storeStuff(input) {
      if (input !== null) {
        vm.wardList = input;
      }
    }

    function selectWard() {
      if (vm.selectedWard === undefined) {
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
