(function (app) {

  'use strict';

  app.registerModule('children', ['angularMoment', 'core', 'pascalprecht.translate', 'ngSanitize']);
  app.registerModule('children.services', []);
  app.registerModule('children.report', []);
  app.registerModule('children.updateviews', []);
  app.registerModule('children.translate', []);
  app.registerModule('children.stakes', []);
  app.registerModule('children.getsync', []);
  app.registerModule('children.modalService', ['ui.bootstrap']);
  app.registerModule('children.pouchService', ['pouchdb', 'uuid']);
  app.registerModule('children.zscoreService', []);
  app.registerModule('children.spinner', ['angularSpinner']);
  app.registerModule('children.routes', ['ui.router', 'core.routes', 'children.services']);
}(ApplicationConfiguration));
