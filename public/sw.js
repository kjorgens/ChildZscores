/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.0.0-beta.0/workbox-sw.js");

if (workbox) {

  workbox.setConfig({
    debug: true
  });
  console.log(`Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([]);

} else {
  console.log(`Workbox didn't load 😬`);
}
