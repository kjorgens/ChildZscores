(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenModalController', ChildrenModalController);

  ChildrenModalController.$inject = ['$uibModalInstance'];

  function ChildrenModalController($uibModalInstance) {
    var vm = this;

    vm.dismiss = function () {
      $uibModalInstance.dismiss();
    };

    vm.close = function () {
      $uibModalInstance.close();
    };
  }
}());

