(function () {
  'use strict';

  angular
    .module('core.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/modules/children/client/views/country.client.view.html',
        controller: 'ChildrenCountryController',
        controllerAs: 'vm',
        resolve: {
          countryResolve: listCountries
          // childResolve: listChildren
        }
        // data: {
        //   roles: ['user', 'admin']
        // }
      })
      .state('fileDownload', {
        url: '/files/:fileToDownload',
        // templateUrl: 'modules/children/client/views/sync-children.client.view.html',
        // controller: 'ChildrenSyncController',
        // controllerAs: 'vm',
        data: {
          roles: ['admin', 'sync']
          //       pageTitle: 'Sync database {{ database.title }}'
        }
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: '/modules/core/client/views/404.client.view.html',
        controller: 'ErrorController',
        controllerAs: 'vm',
        params: {
          message: function ($stateParams) {
            return $stateParams.message;
          }
        },
        data: {
          ignoreState: true
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: '/modules/core/client/views/400.client.view.html',
        controller: 'ErrorController',
        controllerAs: 'vm',
        params: {
          message: function ($stateParams) {
            return $stateParams.message;
          }
        },
        data: {
          ignoreState: true,
          pageTitle: 'Chrome Only Please'
        }
      })
      .state('sync-error', {
        url: '/sync-error',
        templateUrl: '/modules/core/client/views/syncerror.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Database Sync error'
        }
      })
      .state('500-error', {
        url: '/server-error',
        templateUrl: '/modules/core/client/views/500.client.view.html',
        controller: 'HeaderController',
        data: {
          ignoreState: true,
          pageTitle: 'Database error'
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: '/modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true
        }
      });

    listCountries.$inject = ['$stateParams', 'PouchService'];

    function listCountries($stateParams, PouchService) {
      return PouchService.getCountriesList(true);
    }
  }
}());
