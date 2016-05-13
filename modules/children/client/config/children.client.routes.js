(function () {
  'use strict';

  angular
    .module('children.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
        .state('children', {
          abstract: true,
          url: '/children',
          template: '<ui-view/>'
        })
        .state('children.list', {
          url: '/list/:stakeDB/:stakeName',
          templateUrl: 'modules/children/client/views/list-children.client.view.html',
          controller: 'ChildrenListController',
          controllerAs: 'vm',
          resolve: {
    //        childResolve: listChildren
            childResolve: initLocalDb
          },
          data: {

          }
        })
        .state('children.remove', {
          url: '/remove/:childId',
          templateUrl: 'modules/children/client/views/remove-child.client.view.html',
          controller: 'ChildrenRemoveController',
          controllerAs: 'vm',
          resolve: {
            childRemove: getChild
          },
          data: {
            roles: ['user', 'admin']
            //       pageTitle: 'Sync database {{ database.title }}'
          }
        })
        .state('children.sync', {
          url: '/sync/:stakeDB/:stakeName',
          templateUrl: 'modules/children/client/views/sync-children.client.view.html',
          controller: 'ChildrenSyncController',
          controllerAs: 'vm',
          resolve: {
            childSync: listCountries
          },
          data: {
            roles: ['admin', 'sync']
            //       pageTitle: 'Sync database {{ database.title }}'
          }
        })
        .state('children.report', {
          url: '/report/:stakeDB',
          templateUrl: 'modules/children/client/views/sync-children.client.view.html',
          controller: 'ChildrenSyncController',
          controllerAs: 'vm',
          resolve: {
            genReport: generateCSV
          },
          data: {
            roles: ['admin', 'sync']
            //       pageTitle: 'Sync database {{ database.title }}'
          }
        })
        .state('children.getsync', {
          url: '/syncinfo/',
          templateUrl: 'modules/children/client/views/sync-children.client.view.html',
          controller: 'ChildrenSyncController',
          controllerAs: 'vm',
          resolve: {
            ChildrenSync: getSyncInfo
          },
          data: {
            roles: ['admin', 'sync']
            //       pageTitle: 'Sync database {{ database.title }}'
          }
        })
        .state('children.countries', {
          url: '/countries',
          templateUrl: 'modules/children/client/views/country.client.view.html',
          controller: 'ChildrenCountryController',
          controllerAs: 'vm',
          resolve: {
            countryResolve: listCountries
            // childResolve: listChildren
          },
          data: {

          }
        })
        .state('children.stake', {
          url: '/stakes/:country',
          templateUrl: 'modules/children/client/views/stakes.client.view.html',
          controller: 'ChildrenStakeController',
          controllerAs: 'vm',
          data: {

          }
        })
        .state('children.newsurvey', {
          url: '/survey/:childId',
          templateUrl: 'modules/children/client/views/add-survey.client.view.html',
          controller: 'SurveyController',
          controllerAs: 'vm',
          resolve: {
            surveyResolve: getSurvey
          },
          data: {

          }
        })
        .state('children.create', {
          url: '/create',
          templateUrl: 'modules/children/client/views/form-child.client.view.html',
          controller: 'ChildrenController',
          controllerAs: 'vm',
          resolve: {
            childResolve: newChild
          },
          data: {

          }
        })
        .state('children.edit', {
          url: '/edit/:childId',
          templateUrl: 'modules/children/client/views/form-child.client.view.html',
          controller: 'ChildrenController',
          controllerAs: 'vm',
          resolve: {
            childResolve: getChild
          },
          data: {

          }
        })
        .state('children.editsurvey', {
          url: '/survey/edit/:childId/:surveyId',
          templateUrl: 'modules/children/client/views/add-survey.client.view.html',
          controller: 'SurveyController',
          controllerAs: 'vm',
          resolve: {
            surveyResolve: getSurvey
          },
          data: {

          }
        })
        .state('children.removeSurvey', {
          url: '/survey/remove/:childId/:surveyId',
          templateUrl: 'modules/children/client/views/remove-screening.client.view.html',
          controller: 'SurveyController',
          controllerAs: 'vm',
          resolve: {
            surveyResolve: getSurvey
          },
          data: {

          }
        })
        .state('children.view', {
          url: '/view/:childId',
          templateUrl: 'modules/children/client/views/view-child.client.view.html',
          controller: 'ChildrenController',
          controllerAs: 'vm',
          resolve: {
            childResolve: getChild
          },
          data: {

          }
        });
  }

  listChildren.$inject = ['$stateParams', 'PouchService'];
  function listChildren($stateParams, PouchService) {
    PouchService.createDatabase($stateParams.stakeDB);
    PouchService.createIndex('firstName');
    PouchService.createIndex('lastName');
    PouchService.createIndex('owner');
    PouchService.createIndex('surveyDate');
    return PouchService.queryChildPromise();
  }

  initLocalDb.$inject = ['$stateParams', 'PouchService'];
  function initLocalDb($stateParams, PouchService) {
    PouchService.createDatabase($stateParams.stakeDB);
    return PouchService.initLocalDb(['firstName', 'lastName', 'owner', 'surveyDate']);
  }

  listCountries.$inject = ['$stateParams', 'ChildrenStakes'];
  function listCountries($stateParams, ChildrenStakes) {
    return ChildrenStakes;
  }

  generateCSV.$inject = ['$stateParams', 'ChildrenReport'];
  function generateCSV($stateParams, ChildrenReport) {
    return ChildrenReport;
  }

  getChild.$inject = ['$stateParams', 'PouchService'];
  function getChild($stateParams, PouchService) {
    if ($stateParams.childId === '') {
      return PouchService;
    } else {
      return PouchService.getOnePromise({
        childId: $stateParams.childId
      });     // .$promise;
    }
  }

  getSyncInfo.$inject = ['$stateParams', 'ChildrenGetSync', 'Authentication'];
  function getSyncInfo($stateParams, ChildrenGetSync) {
    return ChildrenGetSync.get();
  }

  getSurvey.$inject = ['$stateParams', 'PouchService'];
  function getSurvey($stateParams, PouchService) {
    if ($stateParams.surveyId === undefined) {
      return PouchService;
    } else {
      return PouchService.getOnePromise({
        childId: $stateParams.surveyId
      });
    }
  }

  newChild.$inject = ['PouchService'];
  function newChild(PouchService) {
    return PouchService;
  }

  listDataBases.$inject = ['PouchService'];
  function listDataBases(PouchService) {
    return PouchService;
  }
}());
