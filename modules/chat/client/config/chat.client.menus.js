(function () {
  'use strict';

  angular
      .module('chat')
      .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    if (navigator.onLine) {
      menuService.addMenuItem('topbar', {
        title: 'Chat',
        state: 'chat'
      });
    }
  }
}());
