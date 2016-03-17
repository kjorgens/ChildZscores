(function () {
  'use strict';

  angular
    .module ('children.spinner')
    .config (spinnerConfig);

  spinnerConfig.$inject = ['usSpinnerConfigProvider'];

  function spinnerConfig(usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setTheme ('bigBlue', { color: 'blue', radius: 20 });
    usSpinnerConfigProvider.setTheme ('smallRed', { color: 'red', radius: 6 });
  }
}());