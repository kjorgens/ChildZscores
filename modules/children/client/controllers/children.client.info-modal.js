(function () {
  'use strict';

  angular
      .module('children')
      .controller('InfoModalController', InfoModalController);

  InfoModalController.$inject = ['$scope', '$uibModalInstance', 'input'];

  function InfoModalController($scope, $uibModalInstance, input) {
    $scope.title = input.title;
    $scope.desc = input.desc;
    $scope.cb = input.cb;


    $scope.dismiss = function () {
      $uibModalInstance.dismiss();
      if ($scope.cb) {
        $scope.cb();
      }
    };

    // setTimeout(function() {
    //   $uibModalInstance.dismiss();
    //   if ($scope.cb) {
    //     $scope.cb();
    //   }
    // }, 10000);

  }
}());

