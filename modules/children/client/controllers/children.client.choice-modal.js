(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChoiceModalController', ChoiceModalController);

  ChoiceModalController.$inject = ['$scope', '$state', '$uibModalInstance', 'input'];

  function ChoiceModalController($scope, $state, $uibModalInstance, input) {
    $scope.title = input.title;
    $scope.desc = input.desc;
    $scope.childName = input.childName;
    $scope.cb = input.cb;


    $scope.existingChild = function () {
      $uibModalInstance.dismiss();
      $state.go('children.newsurvey', { childId: input.childId });
      if ($scope.cb) {
        $scope.cb();
      }
    };

    $scope.newChild = function () {
      $uibModalInstance.dismiss();

      if ($scope.cb) {
        $scope.cb();
      }
    };

  }
}());

