(function () {
  'use strict';

  angular
      .module('children')
      .run(menuConfig);

  menuConfig.$inject = ['menuService', 'PouchService'];

  function menuConfig(menuService, PouchService) {
 //    menuService.addMenuItem('topbar', {
 //      title: 'Countries',
 //      state: 'children.countries',
 // //     type: 'dropdown',
 //      roles: ['*']
 //    });
 //    menuService.addMenuItem('topbar', {
 //      title: 'Children',
 //      state: 'children',
 //      type: 'dropdown',
 //      roles: ['*']
 //    });
 //    // menuService.addSubMenuItem('topbar', 'children', {
 //    //   title: 'List Children',
 //    //   state: 'children.list({stakeDB: vm.selectedDB, stakeName: vm.selectedStake})',
 //    //   roles: ['*']
 //    // });
 //    menuService.addSubMenuItem('topbar', 'children', {
 //      title: 'Add Child',
 //      state: 'children.create',
 //      roles: ['*']
 //    });
    // menuService.addSubMenuItem('topbar', 'children', {
    //   title: 'Select Country',
    //   state: 'children.countries',
    //   roles: ['*']
    // });
 


    // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'children', {
    //   title: 'List Children',
    //   state: 'children.list'
    // });
  }
}());
