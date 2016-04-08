(function () {
  'use strict';

// Configuring the Children module
  angular
    .module('children')
    .run(menuConfig);

  menuConfig.$inject = ['$rootScope', 'Menus', 'PouchService', 'ChildrenStakes'];

  function menuConfig($rootScope, Menus, PouchService, ChildrenStakes) {
    // Add the children dropdown item
    $rootScope.selectedStake = 'test';
    PouchService.createDatabase('test');

    PouchService.createIndex('firstName');
    PouchService.createIndex('lastName');
    PouchService.createIndex('owner');
    PouchService.createIndex('surveyDate');
    $rootScope.appOnline = navigator.onLine;
    console.log('App is ' + ($rootScope.appOnline ? 'online' : 'offline'));
    function saveEm(dbs) {
      $rootScope.localDbs = dbs;
      if (dbs.length === 1) {
        $rootScope.selectedStake = dbs[0];
      }
    }
    PouchService.getAllDbsLocal(saveEm);
    if ($rootScope.appOnline) {
      ChildrenStakes.query(function(retVal) {
        $rootScope.remoteDbs = retVal;
      });
    }
    // PouchService.createDatabase('liahona_stakes');
    //
    // PouchService.createIndex('countries')
    // PouchService.createIndex('firstName');
    // PouchService.createIndex('lastName');
    // PouchService.createIndex('owner');
    // PouchService.createIndex('surveyDate');

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
