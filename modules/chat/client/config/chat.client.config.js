(function () {
  'use strict';

  angular
    .module('chat')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    if (navigator.onLine) {
      // Set top bar menu items
      Menus.addMenuItem('topbar', {
        title: 'Chat',
        state: 'chat'
      });
    }
  }
}());

