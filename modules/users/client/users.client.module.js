(function (app) {
  'use strict';

  app.registerModule('users', ['core']);
  app.registerModule('users.admin', ['core.admin']);
  app.registerModule('users.services', ['core']);
  app.registerModule('users.admin.services', ['core.admin']);
  app.registerModule('users.routes', ['ui.router', 'core']);
  app.registerModule('users.admin.routes', ['ui.router', 'users.admin.services', 'core.admin.routes']);
}(ApplicationConfiguration));
