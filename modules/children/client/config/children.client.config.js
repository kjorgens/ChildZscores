(function () {
  'use strict';

// Configuring the Children module
  angular
    .module('children')
    .run(menuConfig);

  menuConfig.$inject = ['$rootScope', 'Menus', 'PouchService'];

  function menuConfig($rootScope, Menus, PouchService) {
    // Add the children dropdown item
    PouchService.createDatabase('Ecuador');
    //
    PouchService.createIndex('firstName');
    PouchService.createIndex('lastName');
    PouchService.createIndex('owner');
    PouchService.createIndex('surveyDate');

    $rootScope.selectedCountry = 'Ecuador';
    Menus.addMenuItem('topbar', {
      title: 'Children',
      state: 'children.list',
 //     type: 'dropdown',
      roles: ['*']
    });
    // Menus.addMenuItem('topbar', {
    //  title: 'Country',
    //  state: 'children.country',
    //  type: 'dropdown',
    //  roles: ['*']
    // });
    //
    // Add the dropdown create item
    // Menus.addSubMenuItem('topbar', 'children.country', {
    //  title: 'Add Country',
    //  state: 'children.country',
    //  roles: ['*']
    // });
    // Add the dropdown create item
    // Menus.addSubMenuItem('topbar', 'children.country', {
    //  title: 'Select Country',
    //  state: 'children.country',
    //  roles: ['*']
    // });
  }
})();
