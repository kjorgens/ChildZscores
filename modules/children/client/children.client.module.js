(function (app) {

  'use strict';

  app.registerModule('children', ['angularMoment', 'core', 'pascalprecht.translate']);
  app.registerModule('children.services');
  app.registerModule('children.translate');
  app.registerModule('children.stakes');
  app.registerModule('children.modalService');
  app.registerModule('children.pouchService', ['pouchdb', 'uuid']);
  app.registerModule('children.zscoreService');
  app.registerModule('children.spinner', ['angularSpinner']);
  app.registerModule('children.routes', ['ui.router', 'core.routes', 'children.services']);
}(ApplicationConfiguration));
