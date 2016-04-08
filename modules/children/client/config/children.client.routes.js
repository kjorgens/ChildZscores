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
          url: '/children',
          templateUrl: 'modules/children/client/views/list-children.client.view.html',
          controller: 'ChildrenListController',
          controllerAs: 'vm',
          resolve: {
            childResolve: listChildren
          }
        })
        // .state('children.country', {
        //   url: '/children/countries',
        //   templateUrl: 'modules/children/client/views/country.client.view.html',
        //   controller: 'ChildrenCountryController',
        //   controllerAs: 'vm',
        //   data: {
        //     roles: ['user', 'admin']
        //   }
        // })
        .state('children.newsurvey', {
          url: '/:childId/survey',
          templateUrl: 'modules/children/client/views/add-survey.client.view.html',
          controller: 'SurveyController',
          controllerAs: 'vm',
          resolve: {
            surveyResolve: getSurvey
          },
          data: {
            roles: ['user', 'admin']
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
            roles: ['user', 'admin']
          }
        })
        .state('children.edit', {
          url: '/:childId/edit',
          templateUrl: 'modules/children/client/views/form-child.client.view.html',
          controller: 'ChildrenController',
          controllerAs: 'vm',
          resolve: {
            childResolve: getChild
          },
          data: {
            roles: ['user', 'admin']
          }
        })
        .state('children.editsurvey', {
          url: '/:childId/survey/:surveyId',
          templateUrl: 'modules/children/client/views/add-survey.client.view.html',
          controller: 'SurveyController',
          controllerAs: 'vm',
          resolve: {
            surveyResolve: getSurvey
          },
          data: {
            roles: ['user', 'admin']
          }
        })
        .state('children.view', {
          url: '/:childId',
          templateUrl: 'modules/children/client/views/view-child.client.view.html',
          controller: 'ChildrenController',
          controllerAs: 'vm',
          resolve: {
            childResolve: getChild
          },
          data: {
            roles: ['user', 'admin']
          }
        });
  }

  listChildren.$inject = ['$stateParams', 'PouchService'];
  function listChildren($stateParams, PouchService) {
    return PouchService.queryChildPromise();
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
