(function () {
  'use strict';

  angular
      .module('children')
      .controller('ChildrenStakeController', ChildrenStakeController);

  ChildrenStakeController.$inject = ['$rootScope', '$scope', '$stateParams'];

  function ChildrenStakeController($rootScope, $scope, $stateParams) {
    var vm = this;

    function findCountry(country) {
      return country.name === $stateParams.country;
    }
    vm.liahonaStakes = $rootScope.liahonaStakes;
    vm.selectedCountry = vm.liahonaStakes.countries.find(findCountry);
    $rootScope.selectedCountry = vm.selectedCountry.name;
    $rootScope.selectedCountryImage = vm.selectedCountry.image;
  }
}());

