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
    sessionStorage.setItem('selectedDBName', $stateParams.stakeDB);
    localStorage.setItem('selectedStake', $stateParams.stakeName);
    localStorage.setItem('selectedDBName', $stateParams.stakeDB);

    vm.selectedStake = $stateParams.stakeName;
    vm.selectedStakeDB = $stateParams.stakeDB;
    function performTranslation() {
      $translate(['BOY', 'GIRL']).then(function (translations) {
        vm.boy = translations.BOY;
        vm.girl = translations.GIRL;
      });
    }
    performTranslation();
    
    vm.onLine = navigator.onLine;
    vm.find = find;
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
  }
}());

