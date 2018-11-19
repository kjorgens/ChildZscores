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
  // uglify = require('gulp-uglify-es'),
  defaultAssets = require('./config/assets/default'),
  testAssets = require('./config/assets/test'),
  glob = require('glob'),
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  zip = require('gulp-vinyl-zip').zip,
  packageJson = require('./package.json'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  runSequence = require('run-sequence'),
  plugins = gulpLoadPlugins({
    rename: {
      'gulp-angular-templatecache': 'templateCache'
    }
  }),
  pngquant = require('imagemin-pngquant'),
  wiredep = require('wiredep').stream,
  path = require('path'),
  endOfLine = require('os').EOL,
  argv = require('yargs').argv,
  protractor = require('gulp-protractor').protractor,
  webdriver_update = require('gulp-protractor').webdriver_update,
  webdriver_standalone = require('gulp-protractor').webdriver_standalone,
  KarmaServer = require('karma').Server,
  swPrecache = require('./sw-precache.js'),
  workboxBuild = require('workbox-build');

var DEV_DIR = 'public';
var DIST_DIR = 'dist/';
// Local settings
var changedTestFiles = [];

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
  process.env.NODE_ENV = 'test';
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
  process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
  process.env.NODE_ENV = 'production';
});

// Nodemon task
gulp.task('nodemon', function () {
  return plugins.nodemon({
    script: 'server.js',
    nodeArgs: ['--debug'],
    ext: 'js,html',
    watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
  });
});

gulp.task('zipit', function() {
  return gulp.src([
    'package.json',
    '.ebextensions/*',
    'server.js',
    'README.md',
    '.npmrc',
    'config/**',
    'modules/**',
    'public/dist/**',
    'public/lib/angular/angular.min.js',
    'public/lib/angular-resource/angular-resource.min.js',
    'public/lib/angular-animate/angular-animate.min.js',
    'public/lib/angular-messages/angular-messages.min.js',
    'public/lib/angular-ui-router/release/angular-ui-router.min.js',
    'public/lib/spin.js/spin.min.js',
    'public/lib/angular-spinner/dist/angular-spinner.min.js',
    'public/lib/angular-ui-utils/ui-utils.min.js',
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
    'public/lib/angular-ui-inderminate/dist/inderminate.min.js',
    'public/lib/angular-ui-mask/dist/mask.min.js',
    'public/lib/angular-ui-scroll/dist/scroll.min.js',
    'public/lib/angular-ui-scrollpoint/dist/scrollpoint.min.js',
    'public/lib/d3/d3.min.js',
    'public/lib/nvd3/build/nv.d3.min.js',
    'public/lib/angular-nvd3/dist/angular-nvd3.min.js',
    'public/lib/bootstrap/dist/css/bootstrap.min.css',
    'public/lib/bootstrap/dist/fonts/*',
    'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
    'public/lib/nvd3/build/nv.d3.min.css',
    'public/register.js',
    'public/*.js',
    'files/**',
    'scripts/**'
  ], { base: "." })
      .pipe(plugins.plumber())
      .pipe(zip('liahonaKids.zip'))
      .pipe(gulp.dest('./'));
});

gulp.task('zipitNew', function() {
  return gulp.src([
    'package.json',
    '.ebextensions/*',
    'server.js',
    'README.md',
    '.npmrc',
    'config/**',
    'files/**',
    'modules/**/*.{html,png,ico,gif,js,css}',
    'scripts/**',
    'public/dist/**',
    'public/lib/**/*.min.js',
    'public/*.js',
  ], { base: '.' })
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

// Nodemon debug task
gulp.task('nodemon-debug', function () {
  return plugins.nodemon({
    script: 'server.js',
    nodeArgs: ['--debug'],
    ext: 'js,html',
    verbose: true,
    watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
  });
});

// Watch Files For Changes
gulp.task('watch', function () {
  // Start livereload
  plugins.livereload.listen();

  // Add watch rules
  gulp.watch(defaultAssets.server.views).on('change', plugins.livereload.changed);
  gulp.watch(defaultAssets.server.allJS, ['eslint']).on('change', plugins.livereload.changed);
  gulp.watch(defaultAssets.client.js, ['eslint']).on('change', plugins.livereload.changed);
  gulp.watch(defaultAssets.client.css, ['csslint']).on('change', plugins.livereload.changed);
  gulp.watch(defaultAssets.client.sass, ['sass', 'csslint']).on('change', plugins.livereload.changed);
  gulp.watch(defaultAssets.client.less, ['less', 'csslint']).on('change', plugins.livereload.changed);

  if (process.env.NODE_ENV === 'production') {
    gulp.watch(defaultAssets.server.gulpConfig, ['templatecache', 'eslint']);
    gulp.watch(defaultAssets.client.views, ['templatecache']).on('change', plugins.livereload.changed);
  } else {
    gulp.watch(defaultAssets.server.gulpConfig, ['eslint']);
    gulp.watch(defaultAssets.client.views).on('change', plugins.livereload.changed);
  }
});

// Watch server test files
gulp.task('watch:server:run-tests', function () {
  // Start livereload
  plugins.livereload.listen();

  // Add Server Test file rules
  gulp.watch([testAssets.tests.server, defaultAssets.server.allJS], ['test:server']).on('change', function (file) {
    changedTestFiles = [];

    // iterate through server test glob patterns
    _.forEach(testAssets.tests.server, function (pattern) {
      // determine if the changed (watched) file is a server test
      _.forEach(glob.sync(pattern), function (f) {
        var filePath = path.resolve(f);

        if (filePath === path.resolve(file.path)) {
          changedTestFiles.push(f);
        }
      });
    });

    plugins.livereload.changed();
  });
});

// CSS linting task
gulp.task('csslint', function (done) {
  return gulp.src(defaultAssets.client.css)
    .pipe(plugins.csslint('.csslintrc'))
    .pipe(plugins.csslint.reporter())
    .pipe(plugins.csslint.reporter(function (file) {
      if (!file.csslint.errorCount) {
        done();
      }
    }));
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

  return gulp.src(assets)
    .pipe(plugins.ngAnnotate())
    .pipe(uglify({
      mangle: false
    }))
    .pipe(plugins.concat('application.min.js'))
    .pipe(gulp.dest('public/dist'));
});

gulp.task('uglify-error-debugging', function (cb) {
  var assets = _.union(
    defaultAssets.client.js,
    defaultAssets.client.templates
  );
  pump([
    gulp.src(assets),
    plugins.uglify(),
    gulp.dest('dist/')
  ], cb);
});
// CSS minifying task
gulp.task('cssmin', function () {
  return gulp.src(defaultAssets.client.css)
    .pipe(plugins.csso())
    .pipe(plugins.concat('application.min.css'))
    .pipe(gulp.dest('public/dist'));
});

// Sass task
gulp.task('sass', function () {
  return gulp.src(defaultAssets.client.sass)
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer())
    .pipe(plugins.rename(function (file) {
      file.dirname = file.dirname.replace(path.sep + 'scss', path.sep + 'css');
    }))
    .pipe(gulp.dest('./modules/'));
});

// Less task
gulp.task('less', function () {
  return gulp.src(defaultAssets.client.less)
    .pipe(plugins.less())
    .pipe(plugins.autoprefixer())
    .pipe(plugins.rename(function (file) {
      file.dirname = file.dirname.replace(path.sep + 'less', path.sep + 'css');
    }))
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
gulp.task('copyLocalEnvConfig', function () {
  var src = [];
  var renameTo = 'local-development.js';

  // only add the copy source if our destination file doesn't already exist
  if (!fs.existsSync('config/env/' + renameTo)) {
    src.push('config/env/local.example.js');
  }

  return gulp.src(src)
    .pipe(plugins.rename(renameTo))
    .pipe(gulp.dest('config/env'));
});

// Make sure upload directory exists
gulp.task('makeUploadsDir', function () {
  return fs.mkdir('modules/users/client/img/profile/uploads', function (err) {
    if (err && err.code !== 'EEXIST') {
      console.error(err);
    }
  });
});

// Angular template cache task
gulp.task('templatecache', function () {
  return gulp.src(defaultAssets.client.views)
    .pipe(plugins.templateCache('templates.js', {
      root: 'modules/',
      module: 'core',
      templateHeader: '(function () {' + endOfLine + '	\'use strict\';' + endOfLine + endOfLine + '	angular' + endOfLine + '		.module(\'<%= module %>\'<%= standalone %>)' + endOfLine + '		.run(templates);' + endOfLine + endOfLine + '	templates.$inject = [\'$templateCache\'];' + endOfLine + endOfLine + '	function templates($templateCache) {' + endOfLine,
      templateBody: '		$templateCache.put(\'<%= url %>\', \'<%= contents %>\');',
      templateFooter: '	}' + endOfLine + '})();' + endOfLine
    }))
    .pipe(gulp.dest('build'));
});

// Mocha tests task
gulp.task('mocha', function (done) {
  // Open mongoose connections
  var mongoose = require('./config/lib/mongoose.js');
  var testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server;
  var error;

  // Connect mongoose
  mongoose.connect(function () {
    mongoose.loadModels();
    // Run the tests
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
        // When the tests are done, disconnect mongoose and pass the error state back to gulp
        mongoose.disconnect(function () {
          done(error);
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
gulp.task('mocha:coverage', ['pre-test', 'mocha'], function () {
  var testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server;

  return gulp.src(testSuites)
    .pipe(plugins.istanbul.writeReports({
      reportOpts: { dir: './coverage/server' }
    }));
});

// Karma test runner task
gulp.task('karma', function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

// Run karma with coverage options set and write report
gulp.task('karma:coverage', function(done) {
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
  var mongoose = require('./config/lib/mongoose.js');

  mongoose.connect(function (db) {
    db.connection.db.dropDatabase(function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log('Successfully dropped db: ', db.connection.db.databaseName);
      }
      db.connection.db.close(done);
    });
  });
});

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

// Start the standalone selenium server
// NOTE: This is not needed if you reference the
// seleniumServerJar in your protractor.conf.js
gulp.task('webdriver_standalone', webdriver_standalone);

// Protractor test runner task
gulp.task('protractor', ['webdriver_update'], function () {
  gulp.src([])
    .pipe(protractor({
      configFile: 'protractor.conf.js'
    }))
    .on('end', function() {
      console.log('E2E Testing complete');
      // exit with success.
      process.exit(0);
    })
    .on('error', function(err) {
      console.error('E2E Tests failed:');
      console.error(err);
      process.exit(1);
    });
});

// Lint CSS and JavaScript files.
gulp.task('lint', function (done) {
  runSequence('less', 'sass', ['csslint', 'eslint'], done);
});

// Lint project files and minify them into two production files.
gulp.task('build', function (done) {
  runSequence('env:dev', 'wiredep:prod', 'lint', ['uglify', 'cssmin'], 'service-worker', done);
});

// Run the project tests
gulp.task('test', function (done) {
  runSequence('env:test', 'test:server', 'karma', 'nodemon', 'protractor', done);
});



gulp.task('test:server', function (done) {
  runSequence('env:test', ['copyLocalEnvConfig', 'makeUploadsDir', 'dropdb'], 'lint', 'mocha', done);
});

// Watch all server files for changes & run server tests (test:server) task on changes
// optional arguments:
//    --onlyChanged - optional argument for specifying that only the tests in a changed Server Test file will be run
// example usage: gulp test:server:watch --onlyChanged
gulp.task('test:server:watch', function (done) {
  runSequence('test:server', 'watch:server:run-tests', done);
});

gulp.task('test:client', function (done) {
  runSequence('env:test', 'lint', 'dropdb', 'karma', done);
});

gulp.task('test:e2e', function (done) {
  runSequence('env:test', 'lint', 'dropdb', 'nodemon', 'protractor', done);
});

gulp.task('test:childrene2e', function (done) {
  runSequence('env:test', 'lint', 'dropdb', 'nodemon', 'protractor', done);
});

// Run the project in development mode
gulp.task('default', function (done) {
  runSequence('env:dev', ['copyLocalEnvConfig', 'makeUploadsDir'], 'lint', ['nodemon', 'watch'], done);
});

// Run the project in debug mode
gulp.task('debug', function (done) {
  runSequence('env:dev', ['copyLocalEnvConfig', 'makeUploadsDir'], 'lint', ['node-inspector', 'nodemon-debug', 'watch'], done);
});

// Run the project in production mode
gulp.task('prod', function (done) {
  runSequence(['copyLocalEnvConfig', 'makeUploadsDir', 'templatecache'], 'build', 'env:prod', 'lint', ['nodemon', 'watch'], 'zipit', done);
});

// Run the project in production mode
gulp.task('zip', function (done) {
  runSequence('build', 'copy-bundle-stuff', 'zipit', done);
});

function runExpress(port, rootDir) {
  var app = express();

  app.use(express.static(rootDir));
  app.set('views', path.join(rootDir, 'views'));
  app.set('view engine', 'jade');

  app.get('/dynamic/:page', function(req, res) {
    res.render(req.params.page);
  });

  var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server running at http://%s:%s', host, port);
  });
}

function writeServiceWorkerFile(rootDir, handleFetch, callback) {
  var config = {
    cacheId: packageJson.name,
    /*
    dynamicUrlToDependencies: {
      'dynamic/page1': [
        path.join(rootDir, 'views', 'layout.jade'),
        path.join(rootDir, 'views', 'page1.jade')
      ],
      'dynamic/page2': [
        path.join(rootDir, 'views', 'layout.jade'),
        path.join(rootDir, 'views', 'page2.jade')
      ]
    },
    */
    // If handleFetch is false (i.e. because this is called from generate-service-worker-dev), then
    // the service worker will precache resources but won't actually serve them.
    // This allows you to test precaching behavior without worry about the cache preventing your
    // local changes from being picked up during the development cycle.
    handleFetch: handleFetch,
    logger: plugins.util.log,
    runtimeCaching: [{
      // See https://github.com/GoogleChrome/sw-toolbox#methods
      urlPattern: /runtime-caching/,
      handler: 'cacheFirst',
      // See https://github.com/GoogleChrome/sw-toolbox#options
      options: {
        cache: {
          maxEntries: 1,
          name: 'runtime-cache'
        }
      }
    }],
    staticFileGlobs: [
      'dist/public/**',
      'dist/modules/**/*.{html,ico,png,jpg,gif,css}'
    ],
    stripPrefix: 'dist/',
    // verbose defaults to false, but for the purposes of this demo, log more.
    verbose: true
  };

  swPrecache.write(path.join(rootDir, 'public/service-worker.js'), config, callback);
}

gulp.task('default', ['serve-dist']);

gulp.task('build-sw', function(callback) {
  runSequence('copy-bundle-stuff', 'generate-service-worker-dist', callback);
});

gulp.task('clean', function() {
  del.sync([DIST_DIR]);
});

gulp.task('serve-dev', ['generate-service-worker-dev'], function() {
  runExpress(3001, DEV_DIR);
});

gulp.task('serve-dist', ['build'], function() {
  runExpress(3000, DIST_DIR);
});

// gulp.task('gh-pages', ['build'], function(callback) {
//   ghPages.publish(path.join(__dirname, DIST_DIR), callback);
// });

gulp.task('generate-service-worker-dev', function(callback) {
  writeServiceWorkerFile(DEV_DIR, false, callback);
});

gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile('.', true, callback);
});

gulp.task('copy-dev-to-dist', function() {
  return gulp.src(DEV_DIR + '/**')
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('copy-bundle-stuff', function() {
  var dist = gulp.src('public/dist/**')
    .pipe(gulp.dest('dist/public/dist/'));
  var html = gulp.src('modules/**/*.{html,ico,png,gif,css}')
    .pipe(gulp.dest('dist/modules/'));
  var lib = gulp.src(['public/lib/**/*.min.js',
    'public/lib/angular-ui-router-uib-modal/angular-ui-router-uib-modal.js',
    'public/lib/owasp-password-strength-test/owasp-password-strength-test.js'])
    .pipe(gulp.dest('dist/public/lib/'));
  var pub = gulp.src(['public/register.js', 'public/robots.txt', 'public/humans.txt'])
    .pipe(gulp.dest('dist/public/'));
  return merge(dist, html, lib, pub);
});

gulp.task('service-worker', () => {
  return workboxBuild.generateSW({
    globDirectory: 'dist',
    globPatterns: [
      '**\/*.{html,json,js,css,png,ico}',
    ],
    cacheId: 'liahonaKids',
    swDest: 'public/sw.js',
    maximumFileSizeToCacheInBytes: 8 * 1024 * 1024
  });
});

gulp.task('service-workerIm', () => {
  return workboxBuild.injectManifest({
    swSrc: 'dist/sw.js',
    swDest: 'public/sw.js',
    globDirectory: 'dist',
    globPatterns: [
      '**\/*.{js,css,html,png,ico}',
    ]
  }).then(({count, size, warnings}) => {
    // Optionally, log any warnings and details.
    warnings.forEach(console.warn);
    console.log(`${count} files will be precached, totaling ${size} bytes.`);
  });
});

