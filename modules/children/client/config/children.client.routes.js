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
        url: '/list/:stakeDB/:stakeName/:searchFilter/:colorFilter/:screenType?countryName&countryCode',
        templateUrl: '/modules/children/client/views/list-children.client.view.html',
        controller: 'ChildrenListController',
        controllerAs: 'vm',
        resolve: {
          childResolve: listChildren
        },
        data: {}
      })
      .state('children.remove', {
        url: '/remove/:childId',
        templateUrl: '/modules/children/client/views/remove-child.client.view.html',
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
        url: '/sync/:stakeDB/:stakeName/:screenType?countryName&countryCode&language',
        templateUrl: '/modules/children/client/views/sync-children.client.view.html',
        controller: 'ChildrenSyncController',
        controllerAs: 'vm',
        // resolve: {
        //   childSync: listCountries
        // },
        data: {
          roles: ['admin', 'sync']
          //       pageTitle: 'Sync database {{ database.title }}'
        }
      })
      .state('children.report', {
        url: '/report/:stakeDB/:cCode/:scopeType/:sortField/:language/:csvType',
        templateUrl: '/modules/children/client/views/sync-children.client.view.html',
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
        templateUrl: '/modules/children/client/views/sync-children.client.view.html',
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
        url: '/countries/:networkFirst',
        templateUrl: '/modules/children/client/views/country.client.view.html',
        controller: 'ChildrenCountryController',
        controllerAs: 'vm',
        resolve: {
          countryResolve: getCountryInfo
          // childResolve: listChildren
        },
        data: {}
      })
      .state('children.stake', {
        url: 'list/stakes/:country',
        templateUrl: '/modules/children/client/views/stakes.client.view.html',
        controller: 'ChildrenStakeController',
        controllerAs: 'vm',
        resolve: {
          countryData: singleCountryData
        },
        data: {}
      })
      .state('children.newsurvey', {
        url: '/survey/:childId',
        templateUrl: '/modules/children/client/views/add-survey.client.view.html',
        controller: 'SurveyController',
        controllerAs: 'vm',
        resolve: {
          surveyResolve: getSurvey
        },
        data: {}
      })
      .state('children.create', {
        url: '/create/:dbName',
        templateUrl: '/modules/children/client/views/form-child.client.view.html',
        controller: 'ChildrenController',
        controllerAs: 'vm',
        resolve: {
          childResolve: newChild,
          screenResolve: newScreen
        },
        params: { dbName: null },
        data: {}
      })
      .state('children.edit', {
        url: '/edit/:childId',
        templateUrl: '/modules/children/client/views/form-child.client.view.html',
        controller: 'ChildrenController',
        controllerAs: 'vm',
        resolve: {
          screenResolve: getScreens
          // childResolve: getChild,
          // zscoreStatus: getZcoreStatus
        },
        data: {}
      })
      .state('children.editsurvey', {
        url: '/survey/edit/:childId/:surveyId',
        templateUrl: '/modules/children/client/views/add-survey.client.view.html',
        controller: 'SurveyController',
        controllerAs: 'vm',
        resolve: {
          surveyResolve: getSurvey
        },
        data: {}
      })
      .state('children.removeSurvey', {
        url: '/survey/remove/:childId/:surveyId',
        templateUrl: '/modules/children/client/views/remove-screening.client.view.html',
        controller: 'SurveyController',
        controllerAs: 'vm',
        resolve: {
          surveyResolve: getSurvey
        },
        data: {}
      })
      .state('children.view', {
        url: '/view/:childId',
        templateUrl: '/modules/children/client/views/view-child.client.view.html',
        controller: 'ChildrenController',
        controllerAs: 'vm',
        resolve: {
          screenResolve: getScreens
        },
        data: {}
      })
      .state('children.editMother', {
        url: '/mothers/:motherId/:stakeDB/:stakeName/:screenType',
        templateUrl: '/modules/children/client/views/form-mother.client.view.html',
        controller: 'WomenCreateController',
        controllerAs: 'vm',
        resolve: {
          MotherResolve: getMother
        },
        data: {}
      })
      .state('children.listMothers', {
        url: '/mothers/list/:stakeDB/:stakeName/:screenType',
        templateUrl: '/modules/children/client/views/list-mothers.client.view.html',
        controller: 'MotherController',
        controllerAs: 'vm',
        resolve: {
          MotherResolve: getMotherList
        },
        data: {}
      })
      .state('children.createMother', {
        url: '/mothers/create/:stakeDB/:stakeName/:screenType',
        templateUrl: '/modules/children/client/views/form-mother.client.view.html',
        controller: 'WomenCreateController',
        controllerAs: 'vm',
        resolve: {
          MotherResolve: newMother
        },
        data: {}
      });
  }

  listChildren.$inject = ['$stateParams', 'PouchService'];

  function listChildren($stateParams, PouchService) {
    return (PouchService.createDatabase($stateParams.stakeDB, PouchService.findChildren));
  }

  getMotherList.$inject = ['$stateParams', 'PouchService'];

  function getMotherList($stateParams, PouchService) {
    if (~$stateParams.screenType.indexOf('pregnant')) {
      return (PouchService.createDatabase($stateParams.stakeDB, PouchService.findPregnantWomen));
    } else if (~$stateParams.screenType.indexOf('nursing')) {
      return (PouchService.createDatabase($stateParams.stakeDB, PouchService.findNursingMothers));
    }
  }

  listWards.$inject = ['$stateParams', 'PouchService'];

  function listWards($stateParams, PouchService) {
    return (PouchService.createDatabase($stateParams.stakeDB, PouchService.queryWardPromise, $stateParams.wardId));
  }

  getCountryInfo.$inject = ['$stateParams', 'CountryInfo', 'Authentication'];

  function getCountryInfo($stateParams, CountryInfo, Authentication) {
    if (Authentication.user && Authentication.user.roles.includes('phl-pilot')) {
      return Promise.resolve(CountryInfo.getPhlPilotList());
    } else {
      return Promise.resolve(CountryInfo.getMasterList());
    }
  }

  listCountries.$inject = ['$stateParams', 'PouchService'];

  function listCountries($stateParams, PouchService) {
    return PouchService.getCountriesList($stateParams.networkFirst);
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
      return PouchService.getOneChild({
        childId: $stateParams.childId
      });
    }
  }

  getScreens.$inject = ['$stateParams', 'PouchService', 'ZScores'];

  function getScreens($stateParams, PouchService, ZScores) {
    return new Promise(function (resolve) {
      return PouchService.getScreens($stateParams.childId)
        .then(function (screenList) {
          PouchService.getChildById($stateParams.childId)
            .then(function (child) {
              resolve(ZScores.getStatus(child, screenList.docs));
            });
        });
    });
  }

  newMother.$inject = ['$stateParams', 'PouchService'];

  function newMother($stateParams, PouchService) {
    return PouchService;
  }

  getMother.$inject = ['$stateParams', 'PouchService'];

  function getMother($stateParams, PouchService) {
    return PouchService.getOneMother({
      motherId: $stateParams.motherId
    });
  }

  getSyncInfo.$inject = ['$stateParams', 'ChildrenGetSync', 'Authentication'];

  function getSyncInfo($stateParams, ChildrenGetSync) {
    return ChildrenGetSync.syncDb();
  }

  singleCountryData.$inject = ['$stateParams', 'CountryInfo', 'Authentication'];

  function singleCountryData($stateParams, CountryInfo, Authentication) {
    if (Authentication.user && Authentication.user.roles.includes('phl-pilot')) {
      return Promise.resolve(CountryInfo.getCountryInfoPilot($stateParams.country));
    } else {
      return Promise.resolve(CountryInfo.getCountryInfo($stateParams.country));
    }
  }


  getCountryData.$inject = ['$stateParams', 'PouchService'];

  function getCountryData($stateParams, PouchService) {
    return PouchService.getCountryData($stateParams.country);
  }

  getSurvey.$inject = ['$stateParams', 'PouchService'];

  function getSurvey($stateParams, PouchService) {
    if ($stateParams.surveyId === undefined) {
      return PouchService;
    } else {
      return PouchService.getOneChild({
        childId: $stateParams.surveyId
      });
    }
  }

  newChild.$inject = ['$stateParams', 'PouchService'];

  function newChild($stateParams, PouchService) {
    return PouchService.getDB($stateParams.dbName);
  }

  newScreen.$inject = ['$stateParams', 'PouchService'];

  function newScreen($stateParams, PouchService) {
    return PouchService.getDB($stateParams.dbName);
  }

  listDataBases.$inject = ['PouchService'];

  function listDataBases(PouchService) {
    return PouchService.createDatabase();
  }
}());
