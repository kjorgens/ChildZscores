(function () {
  'use strict';

  angular
    .module('users.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService', '$rootScope'];

  // Configuring the Users module
  function menuConfig(menuService, $rootScope) {
    if (navigator.onLine) {
      menuService.addSubMenuItem('topbar', 'admin', {
        title: 'Manage Users',
        state: 'admin.users'
      });
    }
  }
}());
