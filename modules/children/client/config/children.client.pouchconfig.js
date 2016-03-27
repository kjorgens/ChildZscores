'use strict';

angular.module('children.pouchConfig', []).config(function(pouchDBProvider, POUCHDB_METHODS) {
  var authMethods = {
    login: 'qify',
    logout: 'qify',
    getUser: 'qify'
  };
  pouchDBProvider.methods = angular.extend({}, POUCHDB_METHODS, authMethods);
});
