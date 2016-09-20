'use strict';

// Protractor configuration
var config = {
  specs: ['modules/children/tests/e2e/*.js'],

  reporter: 'mocha-jenkins-reporter',

  mochaOpts: {
    ui: 'bdd',
    reporter: 'mocha-jenkins-reporter',
    reporterOptions: {
      "junit_report_name": "Tests",
      "junit_report_path": 'test/e2e-tests.xml',
      "junit_report_stack": 1
    },
    timeout: 30000,
    bail: true
  }
};

if (process.env.TRAVIS) {
  config.capabilities = {
    browserName: 'firefox'
  };
}

exports.config = config;
