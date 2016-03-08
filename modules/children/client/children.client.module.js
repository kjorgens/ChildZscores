(function (app) {

  'use strict';

  app.registerModule('children');
  app.registerModule('children.services');
  app.registerModule('children.modalService');
  app.registerModule('children.pouchService', ['pouchdb','uuid']);
  app.registerModule('children.zscoreService');
  app.registerModule('children.routes', ['ui.router', 'children.services']);
})(ApplicationConfiguration);

// Use Applicaion configuration module to register a new module
//ApplicationConfiguration.registerModule('children');
