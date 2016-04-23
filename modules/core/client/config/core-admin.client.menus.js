(function () {
  'use strict';

  angular
    .module('core.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    if (navigator.onLine) {
      menuService.addMenuItem('topbar', {
        title: 'Admin',
        state: 'admin',
        type: 'dropdown',
        roles: ['admin']
      });
    }
  }
}());

