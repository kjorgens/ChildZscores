(function () {
  'use strict';

  angular
    .module('children')
    .controller('ChildrenRemoveController', ChildrenRemoveController);

  ChildrenRemoveController.$inject = ['$state', '$scope', '$stateParams', 'childRemove', 'PouchService'];

  function ChildrenRemoveController($state, $scope, $stateParams, childRemove, PouchService) {
    var vm = this;
    vm.child_id = $stateParams.childId;
    vm.child = childRemove;
    vm.selectedStake = localStorage.getItem('selectedStake');
    vm.selectedCountry = localStorage.getItem('selectedCountry');
    vm.selectedCountryImage = localStorage.getItem('selectedCountryImage');
    vm.selectedDB = localStorage.getItem('selectedDBName');
    vm.removeChild = remove;

    var removeResponse = function (res) {
      vm.remResponse = res;
    };

    var removeError = function (error) {
      vm.remError = error;
    };
    // Remove existing Child
    function remove(child) {
      if (child) {
        vm.surveys.forEach(function(toRemove) {
          PouchService.remove(toRemove, removeResponse, removeError);
        });
        PouchService.remove(child, removeResponse, removeError);
        $state.go('children.list', {
          stakeDB: vm.selectedDB, stakeName: vm.selectedStake, screenType: 'children', searchFilter: '', colorFilter: ''
        });
      }
    }

    function setSurveyList(surveys) {
      $scope.$apply(function() {
        vm.surveys = surveys.docs;
      });
    }

    function surveyErrors(error) {
      vm.surveyError = error;
    }

    PouchService.getSurveys(childRemove._id, setSurveyList, surveyErrors);
  }
}());
