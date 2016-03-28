(function () {
  'use strict';

  angular
      .module('children')
      .run(menuConfig);

  menuConfig.$inject = ['menuService', 'PouchService'];

  function menuConfig(menuService, PouchService) {
    PouchService.createDatabase('Ecuador');
    //
    PouchService.createIndex('firstName');
    PouchService.createIndex('lastName');
    PouchService.createIndex('owner');
    PouchService.createIndex('surveyDate');
    
    menuService.addMenuItem('topbar', {
      title: 'Children',
      state: 'children',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'children', {
      title: 'List Children',
      state: 'children.list'
    });
  }
}());
