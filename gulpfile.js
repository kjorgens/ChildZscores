'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  express = require('express'),
  fs = require('fs'),
  pump = require('pump'),
  merge = require('merge-stream'),
  uglify = require('gulp-uglify-es').default,
  terser = require('gulp-terser'),
  defaultAssets = require('./config/assets/default'),
  testAssets = require('./config/assets/test'),
  testConfig = require('./config/env/test'),
  glob = require('glob'),
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  zip = require('gulp-vinyl-zip').zip,
  packageJson = require('./package.json'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  // runSequence = require('run-sequence'),
  plugins = gulpLoadPlugins({
    rename: {
      'gulp-angular-templatecache': 'templateCache'
    }
  }),
  pngquant = require('imagemin-pngquant'),
  wiredep = require('wiredep').stream,
  path = require('path'),
  endOfLine = require('os').EOL,
  zip = require('gulp-zip'),
  del = require('del'),
  semver = require('semver'),
  workboxBuild = require('workbox-build');

  const sass = require('gulp-sass')(require('sass'));
// Local settings
var changedTestFiles = [];

// Set NODE_ENV to 'test'
gulp.task('env:test', function (done) {
  process.env.NODE_ENV = 'test';
  return done();
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function (done) {
  process.env.NODE_ENV = 'development';
  return done();
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function (done) {
  process.env.NODE_ENV = 'production';
  return done();
});

// Nodemon task
gulp.task('nodemon', function (done) {

  // Node.js v7 and newer use different debug argument
  var debugArgument = semver.satisfies(process.versions.node, '>=7.0.0') ? '--inspect' : '--debug';

  return plugins.nodemon({
    script: 'server.js',
    nodeArgs: [debugArgument],
    ext: 'js,html',
    verbose: true,
    watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
  })
    .on('start', done);
});

gulp.task('zipitNew', function() {
  return gulp.src([
    'dist/**/*'
  ], { base: 'dist/', dot: true })
    .pipe(plugins.plumber())
    .pipe(zip('liahonaKids.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('node-inspector', function() {
  gulp.src([])
    .pipe(plugins.nodeInspector({
      debugPort: 5858,
      webHost: '0.0.0.0',
      webPort: 1337,
      saveLiveEdit: false,
      preload: true,
      inject: true,
      hidden: [],
      stackTraceLimit: 50,
      sslKey: '',
      sslCert: ''
    }));
});

// Nodemon task without verbosity or debugging
gulp.task('nodemon-nodebug', function (done) {
  return plugins.nodemon({
    script: 'server.js',
    ext: 'js,html',
    watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
  })
    .on('start', done);
});

// Watch Files For Changes
gulp.task('watch', function () {
  // Start livereload
  plugins.refresh.listen();

  // Add watch rules
  gulp.watch(defaultAssets.server.views).on('change', plugins.refresh.changed);
  gulp.watch(defaultAssets.server.allJS, gulp.series('eslint')).on('change', plugins.refresh.changed);
  gulp.watch(defaultAssets.client.js, gulp.series('eslint')).on('change', plugins.refresh.changed);
  gulp.watch(defaultAssets.client.css, gulp.series('csslint')).on('change', plugins.refresh.changed);
  gulp.watch(defaultAssets.client.sass, gulp.series('sass', 'csslint')).on('change', plugins.refresh.changed);
  gulp.watch(defaultAssets.client.less, gulp.series('less', 'csslint')).on('change', plugins.refresh.changed);

  if (process.env.NODE_ENV === 'production') {
    gulp.watch(defaultAssets.server.gulpConfig, gulp.series('templatecache', 'eslint'));
    gulp.watch(defaultAssets.client.views, gulp.series('templatecache')).on('change', plugins.refresh.changed);
  } else {
    gulp.watch(defaultAssets.server.gulpConfig, gulp.series('eslint'));
    gulp.watch(defaultAssets.client.views).on('change', plugins.refresh.changed);
  }
});

// Watch server test files
gulp.task('watch:server:run-tests', function () {
  // Start livereload
  plugins.refresh.listen();

  // Add Server Test file rules
  gulp.watch([testAssets.tests.server, defaultAssets.server.allJS], gulp.series('test:server')).on('change', function (file) {
    changedTestFiles = [];

    // iterate through server test glob patterns
    _.forEach(testAssets.tests.server, function (pattern) {
      // determine if the changed (watched) file is a server test
      _.forEach(glob.sync(pattern), function (f) {
        var filePath = path.resolve(f);

        if (filePath === path.resolve(file.path)) {
          changedTestFiles.push(f);
          plugins.refresh.changed(f);
        }
      });
    });
  });
});

// CSS linting task
gulp.task('csslint', function () {
  return gulp.src(defaultAssets.client.css)
    .pipe(plugins.csslint('.csslintrc'))
    .pipe(plugins.csslint.formatter());
    // Don't fail CSS issues yet
    // .pipe(plugins.csslint.failFormatter());
});

// ESLint JS linting task
gulp.task('eslint', function () {
  var assets = _.union(
    defaultAssets.server.gulpConfig,
    defaultAssets.server.allJS,
    defaultAssets.client.js,
    testAssets.tests.server,
    testAssets.tests.client,
    testAssets.tests.e2e
  );

  return gulp.src(assets)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

// JS minifying task
gulp.task('uglify', function () {
  var assets = _.union(
    defaultAssets.client.js,
    defaultAssets.client.templates
  );
  del(['public/dist/*']);

  return gulp.src(assets)
    // .pipe(plugins.ngAnnotate())
    .pipe(uglify({
      mangle: false
    }).on('error', function (err) {
      console.log('Uglify error : ', err.toString());
    }))
    .pipe(plugins.concat('application.min.js'))
    //.pipe(plugins.rev())
    .pipe(gulp.dest('public/dist'));
});

// CSS minifying task
gulp.task('cssmin', async() => {
  return gulp.src(defaultAssets.client.css)
    .pipe(plugins.csso())
    .pipe(plugins.concat('application.min.css'))
    // .pipe(plugins.rev())
    .pipe(gulp.dest('public/dist'));
});

// Sass task
gulp.task('sass', function () {
  return gulp.src(defaultAssets.client.sass)
    .pipe(sass())
    .pipe(plugins.autoprefixer())
    .pipe(gulp.dest('./modules/'));
});

// Less task
gulp.task('less', function () {
  return gulp.src(defaultAssets.client.less)
    .pipe(plugins.less())
    .pipe(plugins.autoprefixer())
    .pipe(gulp.dest('./modules/'));
});

// Imagemin task
gulp.task('imagemin', function () {
  return gulp.src(defaultAssets.client.img)
    .pipe(plugins.imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('public/dist/img'));
});

// wiredep task to default
gulp.task('wiredep', function () {
  return gulp.src('config/assets/default.js')
    .pipe(wiredep({
      ignorePath: '../../'
    }))
    .pipe(gulp.dest('config/assets/'));
});

// wiredep task to production
gulp.task('wiredep:prod', function () {
  return gulp.src('config/assets/production.js')
    .pipe(wiredep({
      ignorePath: '../../',
      fileTypes: {
        js: {
          replace: {
            css: function (filePath) {
              var minFilePath = filePath.replace('.css', '.min.css');
              var fullPath = path.join(process.cwd(), minFilePath);
              if (!fs.existsSync(fullPath)) {
                return '\'' + filePath + '\',';
              } else {
                return '\'' + minFilePath + '\',';
              }
            },
            js: function (filePath) {
              var minFilePath = filePath.replace('.js', '.min.js');
              var fullPath = path.join(process.cwd(), minFilePath);
              if (!fs.existsSync(fullPath)) {
                return '\'' + filePath + '\',';
              } else {
                return '\'' + minFilePath + '\',';
              }
            }
          }
        }
      }
    }))
    .pipe(gulp.dest('config/assets/'));
});

// Copy local development environment config example
gulp.task('copyLocalEnvConfig', function (done) {
  var src = [];
  var renameTo = 'local-development.js';

  // only add the copy source if our destination file doesn't already exist
  if (!fs.existsSync('config/env/' + renameTo)) {
    src.push('config/env/local.example.js');
  }

  if (!src.length) {
    return done();
  }

  return gulp.src(src)
    .pipe(plugins.rename(renameTo))
    .pipe(gulp.dest('config/env'));
});

// Make sure upload directory exists
gulp.task('makeUploadsDir', function (done) {
  return fs.mkdir('modules/users/client/img/profile/uploads', function (err) {
    if (err && err.code !== 'EEXIST') {
      console.error(err);
      return done(err);
    }

    return done();
  });
});

// Angular template cache task
gulp.task('templatecache', function () {
  return gulp.src(defaultAssets.client.views)
    .pipe(plugins.templateCache('templates.js', {
      root: '/modules/',
      module: 'core',
      templateHeader: '(function () {' + endOfLine + '	\'use strict\';' + endOfLine + endOfLine + '	angular' + endOfLine + '		.module(\'<%= module %>\'<%= standalone %>)' + endOfLine + '		.run(templates);' + endOfLine + endOfLine + '	templates.$inject = [\'$templateCache\'];' + endOfLine + endOfLine + '	function templates($templateCache) {' + endOfLine,
      templateBody: '		$templateCache.put(\'<%= url %>\', \'<%= contents %>\');',
      templateFooter: '	}' + endOfLine + '})();' + endOfLine
    }))
    .pipe(gulp.dest('build'));
});

// Mocha tests task
gulp.task('mocha', function (done) {
  var mongooseService = require('./config/lib/mongoose');
  var testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server;
  var error;

  // Connect mongoose
  mongooseService.connect(function (db) {
    // Load mongoose models
    mongooseService.loadModels();

    gulp.src(testSuites)
      .pipe(plugins.mocha({
        reporter: 'spec',
        timeout: 10000
      }))
      .on('error', function (err) {
        // If an error occurs, save it
        error = err;
      })
      .on('end', function () {
        mongooseService.disconnect(function (err) {
          if (err) {
            console.log('Error disconnecting from database');
            console.log(err);
          }

          return done(error);
        });
      });
  });
});

// Prepare istanbul coverage test
gulp.task('pre-test', function () {

  // Display coverage for all server JavaScript files
  return gulp.src(defaultAssets.server.allJS)
    // Covering files
    .pipe(plugins.istanbul())
    // Force `require` to return covered files
    .pipe(plugins.istanbul.hookRequire());
});

// Run istanbul test and write report
gulp.task('mocha:coverage', gulp.series('pre-test', 'mocha', function () {
  var testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server;

  return gulp.src(testSuites)
    .pipe(plugins.istanbul.writeReports({
      reportOpts: { dir: './coverage/server' }
    }));
}));

// Karma test runner task
gulp.task('karma', function (done) {
  var KarmaServer = require('karma').Server;
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

// Run karma with coverage options set and write report
gulp.task('karma:coverage', function (done) {
  var KarmaServer = require('karma').Server;
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    preprocessors: {
      'modules/*/client/views/**/*.html': ['ng-html2js'],
      'modules/core/client/app/config.js': ['coverage'],
      'modules/core/client/app/init.js': ['coverage'],
      'modules/*/client/*.js': ['coverage'],
      'modules/*/client/config/*.js': ['coverage'],
      'modules/*/client/controllers/*.js': ['coverage'],
      'modules/*/client/directives/*.js': ['coverage'],
      'modules/*/client/services/*.js': ['coverage']
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage/client',
      reporters: [
        { type: 'lcov', subdir: '.' }
        // printing summary to console currently weirdly causes gulp to hang so disabled for now
        // https://github.com/karma-runner/karma-coverage/issues/209
        // { type: 'text-summary' }
      ]
    }
  }, done).start();
});

// Drops the MongoDB database, used in e2e testing
gulp.task('dropdb', function (done) {
  // Use mongoose configuration
  var mongooseService = require('./config/lib/mongoose');

  mongooseService.connect(function (db) {
    db.dropDatabase(function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log('Successfully dropped db: ', db.databaseName);
      }

      mongooseService.disconnect(done);
    });
  });
});

// Seed Mongo database based on configuration
gulp.task('mongo-seed', function (done) {
  var db = require('./config/lib/mongoose');
  var seed = require('./config/lib/mongo-seed');

  // Open mongoose database connection
  db.connect(function () {
    db.loadModels();

    seed
      .start({
        options: {
          logResults: true
        }
      })
      .then(function () {
        // Disconnect and finish task
        db.disconnect(done);
      })
      .catch(function (err) {
        db.disconnect(function (disconnectError) {
          if (disconnectError) {
            console.log('Error disconnecting from the database, but was preceded by a Mongo Seed error.');
          }

          // Finish task with error
          done(err);
        });
      });
  });

});

// Downloads the selenium webdriver if protractor version is compatible
gulp.task('webdriver_update', function (done) {
  return require('gulp-protractor').webdriver_update(done);
});

// Start the standalone selenium server
// NOTE: This is not needed if you reference the
// seleniumServerJar in your protractor.conf.js
gulp.task('webdriver_standalone', function (done) {
  return require('gulp-protractor').webdriver_standalone(done);
});

// Protractor test runner task
gulp.task('protractor', gulp.series('webdriver_update', function (done) {
  var protractor = require('gulp-protractor').protractor;
  var testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.e2e;

  gulp.src(testSuites)
    .pipe(protractor({
      configFile: 'protractor.conf.js'
    }))
    .on('end', function () {
      console.log('E2E Testing complete');
      // exit with success.
      process.exit(0);
    })
    .on('error', function (err) {
      console.error('E2E Tests failed:');
      console.error(err);
      process.exit(1);
    });
}));

// Lint CSS and JavaScript files.
gulp.task('lint',
  gulp.parallel('less', 'sass', gulp.series('csslint', 'eslint')));

// Lint project files and minify them into two production files.
gulp.task('build',
  gulp.series('wiredep:prod', 'lint', gulp.parallel('uglify', 'cssmin')));

gulp.task('test:server',
  gulp.series('env:test', gulp.parallel('copyLocalEnvConfig', 'makeUploadsDir', 'dropdb'), 'lint', 'mocha'));

// Run the project tests
gulp.task('test',
  gulp.series('env:test', 'test:server', 'karma'));

// Watch all server files for changes & run server tests (test:server) task on changes
gulp.task('test:server:watch',
  gulp.series('test:server', 'watch:server:run-tests'));

gulp.task('test:client',
  gulp.series('env:test', 'lint', 'dropdb', 'karma'));

gulp.task('test:e2e',
  gulp.series('env:test', 'lint', 'dropdb', 'nodemon', 'protractor'));

gulp.task('test:coverage',
  gulp.series('env:test', gulp.parallel('copyLocalEnvConfig', 'makeUploadsDir', 'dropdb'), 'lint', 'mocha:coverage', 'karma:coverage'));

// Run the project in development mode with node debugger enabled
gulp.task('default',
  gulp.series(gulp.parallel('copyLocalEnvConfig', 'makeUploadsDir'), 'lint', gulp.parallel('nodemon', 'watch')));

// Run the project in production mode
gulp.task('prod',
  gulp.series(gulp.parallel('copyLocalEnvConfig', 'makeUploadsDir', 'templatecache'), 'env:prod', 'build', 'lint', gulp.parallel('nodemon-nodebug', 'watch')));

// Run Mongo Seed with default environment config
gulp.task('seed',
  gulp.series('env:dev', 'mongo-seed'));

// Run Mongo Seed with production environment config
gulp.task('seed:prod',
  gulp.series('env:prod', 'mongo-seed'));

gulp.task('seed:test',
  gulp.series('env:test', 'mongo-seed'));

gulp.task('service-worker', () => {
  return workboxBuild.generateSW({
    mode: 'development',
    globDirectory: 'dist',
    globPatterns: [
      'public/**/*.{css,js,eot,svg,ttf,woff,woff2}',
      'modules/**/client/**/*.{html,css,png,ico,eot,svg,ttf,woff,woff}',
    ],
    swDest: 'dist/public/sw.js',
    // navigateFallback: 'modules/core/server/views/index.server.view.html',
    // navigateFallbackAllowlist: [
    //   new RegExp('modules/core/server/views/*.html', 'i')
    // ]
  }).then(({ count, size, warnings }) => {
    warnings.forEach(console.warn);
    console.log(`${ count } files will be precached, totaling ${ size } bytes.`);
  }).catch(err => {
    console.log('Uh oh 😬', err);
  });
});

gulp.task('build-manifest', () => {
  return workboxBuild.injectManifest({
    swSrc: 'public/sw.js',
    swDest: 'dist/public/sw.js',
    globDirectory: 'dist',
    globPatterns: [
      'public/**/*.{css,js,eot,svg,ttf,woff,woff2}',
      'modules/**/client/**/*.{html,css,png,ico,eot,svg,ttf,woff,woff}'
    ],
    modifyURLPrefix: {
      'public': ''
    }
    // templatedURLs: {
    //   '/index.html': [
    //     'modules/core/server/views/layout.server.view.html'
    //   ]
    // }
  }).then(({ count, size, warnings }) => {
    warnings.forEach(console.warn);
    console.log(`${ count } files will be precached, totaling ${ size } bytes.`);
  }).catch(err => {
    console.log('Uh oh 😬', err);
  });
});

gulp.task('copy-bundle-stuff', function() {
  var dist = gulp.src('public/dist/**/*')
    .pipe(gulp.dest('dist/public/dist/'));
  var html = gulp.src([
    'modules/**',
    '!modules/**/*.tests.js'
  ]).pipe(gulp.dest('dist/modules/'));
  var libmin = gulp.src([
    'public/lib/angular/angular.min.js',
    'public/lib/angular-resource/angular-resource.min.js',
    'public/lib/angular-animate/angular-animate.min.js',
    'public/lib/angular-messages/angular-messages.min.js',
    'public/lib/angular-ui-router/release/angular-ui-router.min.js',
    'public/lib/angular-spinner/dist/angular-spinner.min.js',
    'public/lib/angular-bootstrap/ui-bootstrap.min.js',
    'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
    'public/lib/jquery/dist/jquery.min.js',
    'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
    'public/lib/pouchdb/dist/pouchdb.min.js',
    'public/lib/pouchdb-all-dbs/dist/pouchdb.all-dbs.min.js',
    'public/lib/pouchdb-find/dist/pouchdb.find.min.js',
    'public/lib/angular-pouchdb/angular-pouchdb.min.js',
    'public/lib/angular-ui-router-uib-modal/angular-ui-router-uib-modal.js',
    'public/lib/moment/min/moment.min.js',
    'public/lib/angular-moment/angular-moment.min.js',
    'public/lib/angular-translate/angular-translate.min.js',
    'public/lib/angular-sanitize/angular-sanitize.min.js',
    'public/lib/angular-ui-validate/dist/validate.min.js',
    'public/lib/angular-ui-event/dist/event.min.js',
    'public/lib/angular-ui-indeterminate/dist/indeterminate.min.js',
    'public/lib/angular-ui-mask/dist/mask.min.js',
    'public/lib/angular-ui-scroll/dist/ui-scroll.min.js',
    'public/lib/angular-ui-scrollpoint/dist/scrollpoint.min.js',
    'public/lib/d3/d3.min.js',
    'public/lib/nvd3/build/nv.d3.min.js',
    'public/lib/angular-nvd3/dist/angular-nvd3.min.js',
    'public/lib/bootstrap/dist/css/bootstrap.min.css',
    'public/lib/bootstrap/dist/fonts/*',
    'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
    'public/lib/nvd3/build/nv.d3.min.css',
    'public/lib/angular-ui-notification/dist/angular-ui-notification.min.css',
    'public/lib/angular-ui-notification/dist/angular-ui-notification.min.js',
    'public/lib/ng-file-upload/ng-file-upload.min.js',
    'public/lib/angular/angular.min.js.map',
    'public/lib/angular-resource/angular-resource.min.js.map',
    'public/lib/angular-animate/angular-animate.min.js.map',
    'public/lib/angular-messages/angular-messages.min.js.map',
    'public/lib/angular-ui-router/release/angular-ui-router.min.js.map',
    'public/lib/angular-file-upload/dist/angular-file-upload.min.js.map',
    'public/lib/jquery/dist/jquery.min.map',
    'public/lib/angular-ui-router/release/angular-ui-router.min.js.map',
    'public/lib/bootstrap/dist/css/bootstrap.min.css.map',
    'public/lib/bootstrap/dist/css/bootstrap-theme.min.css.map',
    'public/lib/nvd3/build/nv.d3.min.css.map',
    'public/lib/moment/min/moment.min.js.map',
    'public/lib/angular-moment/angular-moment.min.js.map',
    'public/lib/angular-sanitize/angular-sanitize.min.js.map',
    'public/lib/nvd3/build/nv.d3.min.js.map'
  ], { base: "." }).pipe(gulp.dest('dist/'));
  var pub = gulp.src(['public/register.js', 'public/robots.txt', 'public/humans.txt', 'public/app.webmanifest'])
    .pipe(gulp.dest('dist/public/'));
  var config = gulp.src(['config/**/*', '.ebextensions/**/*', 'files/**/*'], { base: '.', dot: true })
    .pipe(gulp.dest('dist/'));
  var rootStuff = gulp.src(['./package.json', './server.js', './.npmrc'], { base: '.', dot: true })
    .pipe(gulp.dest('dist/'));
  return merge(dist, html, libmin, pub, config, rootStuff);
});

gulp.task('new-bundle-stuff', function() {
  var dist = gulp.src('public/dist/**/*')
      .pipe(gulp.dest('dist/public/dist/'));
  var html = gulp.src([
    'modules/**',
    '!modules/**/*.tests.js'
  ]).pipe(gulp.dest('dist/modules/'));
  var libmin = gulp.src([
    'public/lib/angular/angular.min.js',
    'public/lib/angular-resource/angular-resource.min.js',
    'public/lib/angular-animate/angular-animate.min.js',
    'public/lib/angular-messages/angular-messages.min.js',
    'public/lib/angular-ui-router/release/angular-ui-router.min.js',
    'public/lib/angular-ui-router/release/ui-router-angularjs.min.js',
    'public/lib/angular-spinner/dist/angular-spinner.min.js',
    'public/lib/angular-bootstrap/ui-bootstrap.min.js',
    'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
    'public/lib/jquery/dist/jquery.min.js',
    'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
    'public/lib/pouchdb/dist/pouchdb.min.js',
    'public/lib/pouchdb-all-dbs/dist/pouchdb.all-dbs.min.js',
    'public/lib/pouchdb-find/dist/pouchdb.find.min.js',
    'public/lib/angular-pouchdb/angular-pouchdb.min.js',
    'public/lib/angular-ui-router-uib-modal/angular-ui-router-uib-modal.js',
    'public/lib/moment/min/moment.min.js',
    'public/lib/angular-moment/angular-moment.min.js',
    'public/lib/angular-translate/angular-translate.min.js',
    'public/lib/angular-sanitize/angular-sanitize.min.js',
    'public/lib/angular-ui-validate/dist/validate.min.js',
    'public/lib/angular-ui-event/dist/event.min.js',
    'public/lib/angular-ui-indeterminate/dist/indeterminate.min.js',
    'public/lib/angular-ui-mask/dist/mask.min.js',
    'public/lib/angular-ui-scroll/dist/ui-scroll.min.js',
    'public/lib/angular-ui-uploader/dist/uploader.min.js',
    'public/lib/angular-ui-utils/index.js',
    'public/lib/angular-ui-scrollpoint/dist/scrollpoint.min.js',
    'public/lib/d3/d3.min.js',
    'public/lib/nvd3/build/nv.d3.min.js',
    'public/lib/angular-nvd3/dist/angular-nvd3.min.js',
    'public/lib/bootstrap/dist/css/bootstrap.min.css',
    'public/lib/bootstrap/dist/fonts/*',
    'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
    'public/lib/bootstrap/dist/js/bootstrap.min.js',
    'public/lib/bootstrap/dist/js/npm.js',
    'public/lib/nvd3/build/nv.d3.min.css',
    'public/lib/angular-ui-notification/dist/angular-ui-notification.min.css',
    'public/lib/angular-ui-notification/dist/angular-ui-notification.min.js',
    'public/lib/ng-file-upload/ng-file-upload.min.js',
    'public/lib/angular/angular.min.js.map',
    'public/lib/angular-resource/angular-resource.min.js.map',
    'public/lib/angular-animate/angular-animate.min.js.map',
    'public/lib/angular-messages/angular-messages.min.js.map',
    'public/lib/angular-ui-router/release/angular-ui-router.min.js.map',
    'public/lib/angular-ui-router/release/ui-router-angularjs.min.js.map',
    'public/lib/angular-file-upload/dist/angular-file-upload.min.js.map',
    'public/lib/jquery/dist/jquery.min.map',
    'public/lib/bootstrap/dist/css/bootstrap.min.css.map',
    'public/lib/bootstrap/dist/css/bootstrap-theme.min.css.map',
    'public/lib/nvd3/build/nv.d3.min.css.map',
    'public/lib/moment/min/moment.min.js.map',
    'public/lib/angular-moment/angular-moment.min.js.map',
    'public/lib/angular-sanitize/angular-sanitize.min.js.map',
    'public/lib/nvd3/build/nv.d3.min.js.map',
    'public/lib/sw-toolbox/sw-toolbox.js',
    'public/lib/sw-toolbox/sw-toolbox.js.map'
  ], { base: "." }).pipe(gulp.dest('dist/'));
  var pub = gulp.src(['public/register.js', 'public/robots.txt', 'public/humans.txt', 'public/app.webmanifest'])
      .pipe(gulp.dest('dist/public/'));
  var config = gulp.src(['config/**/*', '.ebextensions/**/*', 'files/**/*'], { base: '.', dot: true })
      .pipe(gulp.dest('dist/'));
  var rootStuff = gulp.src(['./package.json', './server.js', './.npmrc'], { base: '.', dot: true })
      .pipe(gulp.dest('dist/'));
  return merge(dist, html, libmin, pub, config, rootStuff);
});

gulp.task('build-new-sw',
  gulp.series('new-bundle-stuff', 'service-worker'));

gulp.task('clean', async() => {
  return del(['dist']);
});

// Run the project in production mode
gulp.task('zip',
  gulp.series('clean', 'build', 'build-new-sw', 'zipitNew'));
