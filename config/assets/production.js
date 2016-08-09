'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css'
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/angular/angular.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/spin.js/spin.min.js',
        'public/lib/angular-spinner/angular-spinner.min.js',
        'public/lib/angular-ui-utils/ui-utils.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/pouchdb/dist/pouchdb.min.js',
        'public/lib/pouchdb-all-dbs/dist/pouchdb.all-dbs.min.js',
        'public/lib/pouchdb-find/dist/pouchdb.find.min.js',
        'public/lib/angular-pouchdb/angular-pouchdb.min.js',
        'public/lib/angular-uuid/uuid.min.js',
        'public/lib/angular-ui-router-uib-modal/angular-ui-router-uib-modal.js',
        'public/lib/moment/min/moment.min.js',
        'public/lib/angular-moment/angular-moment.min.js'
        // end bower:js
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  }
};
