(function () {
  'use strict';

  // Configuring the Bountiful kids database module
  angular
    .module('children')
    .run(dataConfig);

  dataConfig.$inject = ['$rootScope'];

  function dataConfig($rootScope) {
    // Add the children dropdown item
    // $rootScope.selectedStake = 'temporary';
    // PouchService.createDatabase('temporary');
    // PouchService.createCountryDatabase('country_list');
    // PouchService.createIndex('firstName');
    // PouchService.createIndex('lastName');
    // PouchService.createIndex('owner');
    // PouchService.createIndex('surveyDate');
    $rootScope.appOnline = navigator.onLine;
    console.log('App is ' + ($rootScope.appOnline ? 'online' : 'offline'));

    // function storeDbList(input) {
    //   $rootScope.globalDBList = input;
    // }
    // function handleError(input) {
    //   console.log(input);
    // }
    //
    // if ($rootScope.appOnline) {
    //   ChildrenStakes.get(function(retVal) {
    //     $rootScope.liahonaStakes = retVal;
    //     PouchService.saveStakesLocal(retVal, storeDbList, handleError);
    //   });
    // } else {
    //   PouchService.getCountriesLocal(storeDbList, handleError);
    // }
  }
}());
