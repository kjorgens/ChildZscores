'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/angular-ui-notification/dist/angular-ui-notification.min.css',
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
        'public/lib/nvd3/build/nv.d3.min.css',
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/angular/angular.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/ng-file-upload/ng-file-upload.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/spin.js/spin.min.js',
        'public/lib/angular-spinner/dist/angular-spinner.min.js',
        'public/lib/angular-ui-utils/index.js',
        'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.min.js',
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/pouchdb/dist/pouchdb.min.js',
        'public/lib/pouchdb-all-dbs/dist/pouchdb.all-dbs.min.js',
        'public/lib/pouchdb-find/dist/pouchdb.find.min.js',
        'public/lib/angular-pouchdb/angular-pouchdb.min.js',
        'public/lib/angular-ui-router-uib-modal/src/angular-ui-router-uib-modal.js',
        'public/lib/moment/min/moment.min.js',
        'public/lib/angular-moment/angular-moment.min.js',
        'public/lib/angular-translate/angular-translate.min.js',
        'public/lib/angular-sanitize/angular-sanitize.min.js',
        'public/lib/angular-ui-validate/dist/validate.min.js',
        'public/lib/angular-ui-event/dist/event.min.js',
        'public/lib/angular-ui-inderminate/dist/inderminate.min.js',
        'public/lib/angular-ui-mask/dist/mask.min.js',
        'public/lib/angular-ui-scroll/dist/scroll.min.js',
        'public/lib/angular-ui-scrollpoint/dist/scrollpoint.min.js',
        'public/lib/d3/d3.min.js',
        'public/lib/nvd3/build/nv.d3.min.js',
        'public/lib/angular-nvd3/dist/angular-nvd3.min.js'
        // end bower:js
        //
        // 'public/lib/angular/angular.js',
        // 'public/lib/angular-bootstrap/ui-bootstrap.js',
        // 'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        // 'public/lib/angular-resource/angular-resource.js',
        // 'public/lib/angular-animate/angular-animate.js',
        // 'public/lib/angular-messages/angular-messages.js',
        // 'public/lib/ng-file-upload/ng-file-upload.js',
        // 'public/lib/angular-ui-router/release/angular-ui-router.js',
        // 'public/lib/spin.js/spin.js',
        // 'public/lib/angular-spinner/dist/angular-spinner.js',
        // 'public/lib/angular-ui-utils/index.js',
        // 'public/lib/angular-file-upload/dist/angular-file-upload.js',
        // 'public/lib/angular-ui-notification/dist/angular-ui-notification.js',
        // 'public/lib/jquery/dist/jquery.js',
        // 'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        // 'public/lib/pouchdb/dist/pouchdb.js',
        // 'public/lib/pouchdb-all-dbs/dist/pouchdb.all-dbs.js',
        // 'public/lib/pouchdb-find/dist/pouchdb.find.js',
        // 'public/lib/angular-pouchdb/angular-pouchdb.js',
        // 'public/lib/angular-ui-router-uib-modal/src/angular-ui-router-uib-modal.js',
        // 'public/lib/moment/moment.js',
        // 'public/lib/angular-moment/angular-moment.js',
        // 'public/lib/angular-translate/angular-translate.js',
        // 'public/lib/angular-sanitize/angular-sanitize.js',
        // 'public/lib/angular-ui-validate/dist/validate.js',
        // 'public/lib/angular-ui-event/dist/event.min.js',
        // 'public/lib/angular-ui-inderminate/dist/inderminate.js',
        // 'public/lib/angular-ui-mask/dist/mask.js',
        // 'public/lib/angular-ui-scroll/dist/scroll.js',
        // 'public/lib/angular-ui-scrollpoint/dist/scrollpoint.js',
        // 'public/lib/d3/d3.js',
        // 'public/lib/nvd3/build/nv.d3.js',
        // 'public/lib/angular-nvd3/dist/angular-nvd3.js'
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  }
};
