(function () {
  'use strict';

// Configuring the Children module
  angular
    .module('children')
    .run(menuConfig);

  menuConfig.$inject = ['Menus', 'PouchService'];

  function menuConfig(Menus, PouchService) {
    // Add the children dropdown item
    PouchService.createDatabase ('child_survey');

    PouchService.createIndex('firstName');
    PouchService.createIndex('lastName');
    PouchService.createIndex('owner');
    PouchService.createIndex('surveyDate');

    Menus.addMenuItem('topbar', {
      title: 'Children',
      state: 'children.list',
 //     type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    //Menus.addSubMenuItem('topbar', 'children', {
    //  title: 'List Children',
    //  state: 'children.list'
    //});

    // Add the dropdown create item
    //Menus.addSubMenuItem('topbar', 'children', {
    //  title: 'Add Child',
    //  state: 'children.create',
    //  roles: ['user']
    //});
  }
})();
