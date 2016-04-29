'use strict';

importScripts('serviceworker-cache-polyfill.js');
importScripts('serviceworker-toolbox.js');

var CACHE_VERSION = '0.0.2';
var CACHE_LIST = {
  'static-cache': 'static-cache',
  'dynamic-cache': 'dynamic-cache-v' + CACHE_VERSION
};

// The SW will be shutdown when not in use to save memory,
// be aware that any global state is likely to disappear
console.log('SW running');

self.addEventListener('install', function (event) {
  console.log('SW installing...');

  // Delete all caches that aren't named in CACHE_LIST.
  // While there is only one cache in this example, the same logic will handle the case where
  // there are multiple versioned caches.
  var expectedCaches = Object.keys(CACHE_LIST).map(function(key) {
    return CACHE_LIST[key];
  });

  event.waitUntil(caches.keys().then(function (cacheNames) {
    console.log('SW cache(s) found!');

    return Promise.all(
        cacheNames.map(function(cacheName) {
          // If this cache name isn't present in the array of "expected" cache names, then delete it.
          if (expectedCaches.indexOf(cacheName) === -1) {
            console.log('Deleting out of date cache: ', cacheName);
            return caches.delete(cacheName);
          }
        })
    );
  }));

  event.waitUntil(caches.open(CACHE_LIST['dynamic-cache']).then(function(cache) {
    console.log(CACHE_LIST['dynamic-cache'] + ' opened. Adding listed assets.');

    return cache.addAll([
      '/',
      '/public/dist/application.min.js',
      '/public/dist/application.min.css',
      '/public/lib/angular/angular.min.js',
      '/public/lib/angular-resource/angular-resource.min.js',
      '/public/lib/angular-animate/angular-animate.min.js',
      '/public/lib/angular-messages/angular-messages.min.js',
      '/public/lib/angular-ui-router/release/angular-ui-router.min.js',
      '/public/lib/angular-ui-utils/ui-utils.min.js',
      '/public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
      '/public/lib/angular-file-upload/angular-file-upload.min.js',
      '/public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
      '/public/lib/pouchdb/dist/pouchdb.min.js',
      '/public/lib/pouchdb-find/dist/pouchdb.find.min.js',
      '/public/lib/pouchdb-all-dbs/dist/pouchdb.all-dbs.min.js',
      '/public/lib/angular-pouchdb/angular-pouchdb.min.js',
      '/public/lib/angular-uuid/uuid.min.js',
      '/public/lib/angular-spinner/angular-spinner.min.js',
      '/public/lib/spin/spin.min.js',
      '/public/lib/angular-translate/angular-translate.min.js',
      '/public/lib/bootstrap/dist/css/bootstrap.min.css',
      '/public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
      '/modules/children/client/views/add-survey.client.view.html',
      '/modules/children/client/views/form-child.client.view.html',
      '/modules/children/client/views/list-children.client.view.html',
      '/modules/children/client/views/view-child.client.view.html',
      '/modules/children/client/views/sync-children.client.view.html',
      '/modules/children/client/views/remove-child.client.view.html',
      '/modules/children/client/views/remove-screening.client.view.html',
      '/modules/children/client/img/boliva.png',
      '/modules/children/client/img/columbia.png',
      '/modules/children/client/img/ecuador.png',
      '/modules/children/client/img/guatamala.png',
      '/modules/children/client/img/mongolia.png',
      '/modules/children/client/img/peru.png',
      '/modules/children/client/img/philippines.png',
      '/modules/children/client/img/zimbabwe.png',
      '/modules/chat/client/views/chat.client.view.html',
      '/modules/core/client/views/400.client.view.html',
      '/modules/core/client/views/403.client.view.html',
      '/modules/core/client/views/404.client.view.html',
      '/modules/core/client/views/header.client.view.html',
      '/modules/core/client/views/home.client.view.html',
      '/modules/children/client/views/stakes.client.view.html'
    ]);
  }));

  event.waitUntil(caches.open(CACHE_LIST['static-cache']).then(function(cache) {
    console.log(CACHE_LIST['static-cache'] + ' opened. Adding listed assets.');

    return cache.addAll([
      '/',
      '/modules/chat/client/css/chat.css',
      '/modules/core/client/css/core.css',
      '/modules/core/client/img/brand/favicon.ico',
      '/modules/core/client/img/brand/logo_small.png',
      '/modules/core/client/img/loaders/loader.gif'
    ]);
  }));
});

var whitelist = [

  'login'

];

self.onmessage = function(msg) {
  console.log('MESSAGE RECEIVED IN SERVICE WORKER ', msg);
};

self.addEventListener('activate', function (event) {
  console.log('SW activating...');
});

self.addEventListener('fetch', function (event) {
  var requestURL = new URL(event.request.url);
  var key;
  var result;
  var value;

  // console.log('SW fetching...');


    // Poke a hole and allow certain routes to go over the network
  for (key in whitelist) {
    if (whitelist.hasOwnProperty(key)) {
      value = whitelist[key];
      if (requestURL.pathname.indexOf(value) !== -1) {
        result = value;
        break;
      }
    }
  }
  if (!result) {
    return event.respondWith(
        fetch(event.request)
            .then(function (response) {
 //             console.log('responding with latest');
              var cacheCopy = response.clone();
              caches.open(CACHE_LIST['dynamic-cache'])
                .then(function (cache) {
                  if (event.request.method !== 'POST') {
                    cache.put(event.request, cacheCopy);
                  }
                });
              return response;
            })
            .catch(function () {
 //             console.log('responding from cache');
              return caches.match(event.request);
            })
    );
  }
});

