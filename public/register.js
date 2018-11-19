'use strict';

var swRegistration;

// register service worker
if ('serviceWorker' in navigator) {
  console.log('CLIENT: service worker registration using sw.js in progress');
  navigator.serviceWorker.register('sw.js', {
    scope: './'
  }).then(function (registration) {
    // Registration was successful
    swRegistration = registration;
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(function (err) {
    // registration failed :(
    console.log('ServiceWorker registration failed: ', err);
  });
}
