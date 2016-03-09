/**
 * Created by karljorgensen on 1/26/16.
 */
(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenListController', ChildrenListController);

  ChildrenListController.$inject = ['$rootScope', '$scope', '$state', 'ModalService', 'ChildrenService', 'PouchService'];

  function ChildrenListController($rootScope, $scope, $state, ModalService, ChildrenService, PouchService) {
    var vm = this;
    vm.childInfoString = childInfoString;
    vm.findOne = findOne;
    vm.find = find;
    vm.appIsOffline = !$rootScope.appOnline;

    vm.syncUpstream = syncUpstream;
    vm.online = $rootScope.appOnline;
    vm.find();

    function childInfoString(child) {
      return child.doc.firstName + ' ' + child.doc.lastName + ' --- Birth age: ' + child.doc.monthAge.toFixed (2) + ' months,' +
          '  Z Scores: height/age: ' + child.doc.zScore.ha.toFixed (2) + ' weight/age: ' + child.doc.zScore.wa.toFixed (2) + ' weight/height: ' +
          child.doc.zScore.wl.toFixed (2);
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
      PouchService.get ({ childId: vm.childId }, getUser, getError);
    }

    function setChildren(res) {
      $scope.$apply(function(){
        vm.childList = res;
      });
    }

    function listChildrenErrors(error) {
      vm.error = error;
    }
    // Find a list of Children
    function find () {
      return PouchService.queryChildren (setChildren, listChildrenErrors);
    }
    var whenDone = function(){
      find();
    };
    var replicateIn = function (input) {
 //     vm.dismiss();
      console.log('couchdb sync complete');
      vm.repInData = input;
    };

    var replicateError = function (err) {
      vm.repError = err;
    };

    function syncUpstream() {
 //     ModalService.progressModal('Synching data to server');

      PouchService.sync ('https://syncuser:mZ7K3AldcIzO@database.liahonakids.org:5984/child_survey', replicateIn, replicateError, whenDone);
    }
  }
})();
