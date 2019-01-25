(function () {
  'use strict';

  angular
    .module('children')
    .controller('ConfirmModalController', ConfirmModalController);

  ConfirmModalController.$inject = ['$scope', '$uibModalInstance', 'confirm'];

  function ConfirmModalController($scope, $uibModalInstance, confirm) {
    $scope.cb = confirm.cb;
    $scope.msg = confirm.msg;
    $scope.title = confirm.title;
    $scope.cancel = confirm.cancel;
    $scope.confirm = confirm.confirm;
    $scope.promise = confirm.promise;
    $scope.conditional = confirm.conditional;

    $scope.dismiss = function (option) {
      $uibModalInstance.dismiss();
      if ($scope.cb) {
        $scope.cb(option);
      }
      $scope.promise.resolve(option);
    };
  }
}());
