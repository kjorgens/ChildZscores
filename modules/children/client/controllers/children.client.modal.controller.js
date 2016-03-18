(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenModalController', ChildrenModalController);

  ChildrenModalController.$inject = ['$scope', '$uibModalInstance'];

  function ChildrenModalController($scope, $uibModalInstance) {
    var vm = this;

    vm.dismiss = function () {
      $uibModalInstance.dismiss();
    };

    vm.close = function () {
      $uibModalInstance.close();
    };
  }
}());

