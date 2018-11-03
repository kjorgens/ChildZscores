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

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.2/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "dist/application.min.css",
    "revision": "cec58fb205a040e92db84a9e981f4a48"
  },
  {
    "url": "dist/application.min.js",
    "revision": "9b3acb96a73841e3f2ef1219ea811cf2"
  },
  {
    "url": "img/bolivia.png",
    "revision": "64400988ebaa8831e58449c0c73f635f"
  },
  {
    "url": "img/brand/favicon.ico",
    "revision": "953e0370a3140a1ae01a1472e5c9bc75"
  },
  {
    "url": "img/brand/faviconold.ico",
    "revision": "f28fab3146b2b8b581ab50c78e2d9446"
  },
  {
    "url": "img/brand/logo_small.png",
    "revision": "6e6f3230637fd08c5523110911a6aac6"
  },
  {
    "url": "img/brand/logo.png",
    "revision": "56221ec4ec667915980e37d616bed1c1"
  },
  {
    "url": "img/brazil.png",
    "revision": "8d87f0b75e6668d777797615bde58466"
  },
  {
    "url": "img/buttons/facebook.png",
    "revision": "c700b78c7765325ace1cf5bbb13002e0"
  },
  {
    "url": "img/buttons/github.png",
    "revision": "25f8c006e1d3f26cc305138cbc4e0ce5"
  },
  {
    "url": "img/buttons/google.png",
    "revision": "34954b21234f63ef7bdab7e8ba3e6ec2"
  },
  {
    "url": "img/buttons/linkedin.png",
    "revision": "15b19cc4e4104eb3f37426161698fa94"
  },
  {
    "url": "img/buttons/paypal.png",
    "revision": "6de60420af4b8cfea3b07eb9d7318de4"
  },
  {
    "url": "img/buttons/twitter.png",
    "revision": "d80337d3ccbb454843d514c0dcb4bc0c"
  },
  {
    "url": "img/cambodia.png",
    "revision": "749be85badc9f0f37f053d7578f074ac"
  },
  {
    "url": "img/columbia.png",
    "revision": "656835a22f4f29e61a115600b5b23614"
  },
  {
    "url": "img/ecuador.png",
    "revision": "1313bff2394ceb65ed68116ee4e63bbd"
  },
  {
    "url": "img/ghana.png",
    "revision": "ce5941f7c0f70e290aec13191547d325"
  },
  {
    "url": "img/guatamala.png",
    "revision": "29fdb15aa8abe43acdc0291d0112a1b4"
  },
  {
    "url": "img/haiti.png",
    "revision": "adbb31ccf4587ee598a1628705d38a72"
  },
  {
    "url": "img/honduras.png",
    "revision": "6a92a845c8b8145e98730dbd39d0af46"
  },
  {
    "url": "img/kiribati.png",
    "revision": "b1de709f24a43364aa676fcd78c6e92a"
  },
  {
    "url": "img/loaders/loader.gif",
    "revision": "58d9c8e0b4adde501e89e69625f36717"
  },
  {
    "url": "img/madagascar.png",
    "revision": "db788bc8615dadfce4df8e73442c3af0"
  },
  {
    "url": "img/mongolia.png",
    "revision": "b86a54f2cfcccf6cb091b9dfbd10896d"
  },
  {
    "url": "img/nicaragua.png",
    "revision": "2d9334dd43a4d004de348f0d27d84193"
  },
  {
    "url": "img/paraguay.png",
    "revision": "b7a464896e0d7ecdc7e25eca7cc2c90c"
  },
  {
    "url": "img/peru.png",
    "revision": "bf9a5914296c24c2f1471b34c5114c53"
  },
  {
    "url": "img/philippines.png",
    "revision": "dba41a094a1aaa5da11dbed6666ec226"
  },
  {
    "url": "img/profile/default.png",
    "revision": "02e09323f1cb09a6d3fcd4f16aab0cc5"
  },
  {
    "url": "img/salvador.png",
    "revision": "99719728bf60db9cd97e2a3cc5935a2b"
  },
  {
    "url": "img/sierraleone.png",
    "revision": "06bb9c9827e0b21110f7c6226662341a"
  },
  {
    "url": "img/zimbabwe.png",
    "revision": "75a062d2ebe6c949046ac06c21810f97"
  },
  {
    "url": "lib/angular-animate/angular-animate.min.js",
    "revision": "fb4ae45e62f1c6956679f4711c225b80"
  },
  {
    "url": "lib/angular-bootstrap/ui-bootstrap-csp.css",
    "revision": "d5e11e25b60b74ea937170e29f6a63d6"
  },
  {
    "url": "lib/angular-bootstrap/ui-bootstrap-tpls.min.js",
    "revision": "505c5211f870df73aa8198286cb9c001"
  },
  {
    "url": "lib/angular-bootstrap/ui-bootstrap.min.js",
    "revision": "7f90edcb4b484980d220ea1ccde8334f"
  },
  {
    "url": "lib/angular-file-upload/dist/angular-file-upload.min.js",
    "revision": "8e334aa0539982ed4df1c4a1e0767330"
  },
  {
    "url": "lib/angular-messages/angular-messages.min.js",
    "revision": "cff1a9ee16c066e59fe10de0ef098c6d"
  },
  {
    "url": "lib/angular-moment/angular-moment.min.js",
    "revision": "2b801311393f16e400d405c08c7d0ec8"
  },
  {
    "url": "lib/angular-nvd3/dist/angular-nvd3.min.js",
    "revision": "8e64d5ee7087973eb380d3eba5d4a504"
  },
  {
    "url": "lib/angular-pouchdb/angular-pouchdb.min.js",
    "revision": "a111f41b35f329be7ecf1d4e993e7c53"
  },
  {
    "url": "lib/angular-resource/angular-resource.min.js",
    "revision": "e260665695e31fb9ce9290da1d045d8c"
  },
  {
    "url": "lib/angular-sanitize/angular-sanitize.min.js",
    "revision": "cfca0c834e8a4a014374922dbd5f5652"
  },
  {
    "url": "lib/angular-spinner/dist/angular-spinner.min.js",
    "revision": "f25d26acc2e857d981a916e17177f7c5"
  },
  {
    "url": "lib/angular-translate/angular-translate.min.js",
    "revision": "19e6391590db022c1d105b4a6f341d78"
  },
  {
    "url": "lib/angular-ui-event/dist/event.min.js",
    "revision": "6cfec5cd8511d60422921eb41b6cedc1"
  },
  {
    "url": "lib/angular-ui-indeterminate/dist/indeterminate.min.js",
    "revision": "157e843f6e5dd7fc103baa64bf76ed1c"
  },
  {
    "url": "lib/angular-ui-mask/dist/mask.min.js",
    "revision": "af23bc21e0624b3a9696cbda8a537b3e"
  },
  {
    "url": "lib/angular-ui-mask/logos/browser-stack.png",
    "revision": "1bbd0009b0b4fcb04b8ee54c2eb314d4"
  },
  {
    "url": "lib/angular-ui-router-uib-modal/sample/css/styles.css",
    "revision": "4238129cdc0e2308bd53d7553de1d2f7"
  },
  {
    "url": "lib/angular-ui-router/release/angular-ui-router.min.js",
    "revision": "4109345468c06170e78520046957d00b"
  },
  {
    "url": "lib/angular-ui-router/release/resolveService.min.js",
    "revision": "6f25acc767456427ed3dd38c36c80a78"
  },
  {
    "url": "lib/angular-ui-router/release/stateEvents.min.js",
    "revision": "0cab75693f8c60e263b1797375916b27"
  },
  {
    "url": "lib/angular-ui-router/release/ui-router-angularjs.min.js",
    "revision": "9c7950bf834ed2f9f4fbdd34afea271b"
  },
  {
    "url": "lib/angular-ui-scroll/demo/css/bootstrap.css",
    "revision": "5ba37ad9163643c32251366754f08b2a"
  },
  {
    "url": "lib/angular-ui-scroll/demo/css/style.css",
    "revision": "4daad8915f0da946f55faf32d0ce984b"
  },
  {
    "url": "lib/angular-ui-scroll/demo/grid-dnd-sort-2/grid.css",
    "revision": "915622c20260a0e0c75020c9daed08e4"
  },
  {
    "url": "lib/angular-ui-scroll/demo/grid-dnd-sort/grid.css",
    "revision": "915622c20260a0e0c75020c9daed08e4"
  },
  {
    "url": "lib/angular-ui-scroll/demo/grid-dnd-widths/grid.css",
    "revision": "7b115b81377e0dc53317d830fb436735"
  },
  {
    "url": "lib/angular-ui-scroll/demo/grid-layout-apply/grid.css",
    "revision": "9a20408a1f00bc1971c4573acbc77b9b"
  },
  {
    "url": "lib/angular-ui-scroll/demo/grid-layout-manipulations/grid.css",
    "revision": "9a20408a1f00bc1971c4573acbc77b9b"
  },
  {
    "url": "lib/angular-ui-scroll/demo/grid-scopes-wrapping/grid.css",
    "revision": "9a20408a1f00bc1971c4573acbc77b9b"
  },
  {
    "url": "lib/angular-ui-scroll/demo/ui-scroll-demo.gif",
    "revision": "0b4a6c366b132d32f04670fbf474c3e0"
  },
  {
    "url": "lib/angular-ui-scroll/dist/ui-scroll-grid.min.js",
    "revision": "56db96781a10f6177ede6b09bfc2d674"
  },
  {
    "url": "lib/angular-ui-scroll/dist/ui-scroll-jqlite.min.js",
    "revision": "e3ba77f424a553f22ed20a927f47a113"
  },
  {
    "url": "lib/angular-ui-scroll/dist/ui-scroll.min.js",
    "revision": "f6e522ecb8aaad45dba394e7dd14d12a"
  },
  {
    "url": "lib/angular-ui-scrollpoint/demo/style.css",
    "revision": "3f2a83c9a708605b4fb71db1dcf2eb49"
  },
  {
    "url": "lib/angular-ui-scrollpoint/dist/scrollpoint.min.js",
    "revision": "7c83860af55b48b8349ac7d13e77cb59"
  },
  {
    "url": "lib/angular-ui-uploader/dist/uploader.min.js",
    "revision": "608d39baef083f1771ab98fe3a40e6f0"
  },
  {
    "url": "lib/angular-ui-validate/dist/validate.min.js",
    "revision": "39a94342da7f32cd23b8214ee99fc6e7"
  },
  {
    "url": "lib/angular/angular-csp.css",
    "revision": "5d7bf1728c2447221cad6c6263557306"
  },
  {
    "url": "lib/angular/angular.min.js",
    "revision": "c2ad694ba54a332992cc370fafd0d367"
  },
  {
    "url": "lib/bootstrap/dist/css/bootstrap-theme.css",
    "revision": "b9b46bcc4dad6cc90fc4f95073c50735"
  },
  {
    "url": "lib/bootstrap/dist/css/bootstrap-theme.min.css",
    "revision": "ab6b02efeaf178e0247b9504051472fb"
  },
  {
    "url": "lib/bootstrap/dist/css/bootstrap.css",
    "revision": "2a31dca112f26923b51676cb764c58d5"
  },
  {
    "url": "lib/bootstrap/dist/css/bootstrap.min.css",
    "revision": "ec3bb52a00e176a7181d454dffaea219"
  },
  {
    "url": "lib/bootstrap/dist/js/bootstrap.min.js",
    "revision": "5869c96cc8f19086aee625d670d741f9"
  },
  {
    "url": "lib/d3/d3.min.js",
    "revision": "5bc245068b1b70d4c3eaef79045023e4"
  },
  {
    "url": "lib/jquery/dist/jquery.min.js",
    "revision": "a09e13ee94d51c524b7e2a728c7d4039"
  },
  {
    "url": "lib/jquery/dist/jquery.slim.min.js",
    "revision": "99b0a83cf1b0b1e2cb16041520e87641"
  },
  {
    "url": "lib/jquery/external/sizzle/dist/sizzle.min.js",
    "revision": "a7da9ea7bd03729fae7b8a8c7a596ed1"
  },
  {
    "url": "lib/moment/min/locales.min.js",
    "revision": "770b270c209c0271265d2484416c8587"
  },
  {
    "url": "lib/moment/min/moment-with-locales.min.js",
    "revision": "84474642caf1393a2d16e529c241eb29"
  },
  {
    "url": "lib/moment/min/moment.min.js",
    "revision": "5ff1de69e6fd137a6dd511205ea7c49e"
  },
  {
    "url": "lib/nvd3/build/nv.d3.css",
    "revision": "67958cb7f26c9f7d4b828bd133c14d2f"
  },
  {
    "url": "lib/nvd3/build/nv.d3.min.css",
    "revision": "7433cac9cfd7267ca3fb2a42d01052ea"
  },
  {
    "url": "lib/nvd3/build/nv.d3.min.js",
    "revision": "5f97dd7913869604ba2a5d796585436f"
  },
  {
    "url": "lib/pouchdb-all-dbs/dist/pouchdb.all-dbs.min.js",
    "revision": "4bbe09d094e5f4190071a3be756a7db4"
  },
  {
    "url": "lib/pouchdb-find/dist/pouchdb.find.min.js",
    "revision": "d64876ca7b85c5cf644000ca281279eb"
  },
  {
    "url": "lib/pouchdb-find/www/bootstrap/css/bootstrap-theme.css",
    "revision": "e5f6fb08f469dc836cb3609e23694b3a"
  },
  {
    "url": "lib/pouchdb-find/www/bootstrap/css/bootstrap-theme.min.css",
    "revision": "f0c8fc013c87173a395444fce28cb123"
  },
  {
    "url": "lib/pouchdb-find/www/bootstrap/css/bootstrap.css",
    "revision": "be665bb9f0f7fc89f515adb828fa0a9b"
  },
  {
    "url": "lib/pouchdb-find/www/bootstrap/css/bootstrap.min.css",
    "revision": "58a49b3689d699cb72ffda7252d99fcb"
  },
  {
    "url": "lib/pouchdb-find/www/bootstrap/js/bootstrap.min.js",
    "revision": "046ba2b5f4cff7d2eaaa1af55caa9fd8"
  },
  {
    "url": "lib/pouchdb-find/www/jquery/jquery.min.js",
    "revision": "5790ead7ad3ba27397aedfa3d263b867"
  },
  {
    "url": "lib/pouchdb-find/www/ribbon.png",
    "revision": "d6b446fd9477dad996f1ff0667c5cc9e"
  },
  {
    "url": "lib/pouchdb-find/www/smashbros.css",
    "revision": "a3ae82c6d4ad4252b77faf8eb89b0aeb"
  },
  {
    "url": "lib/pouchdb-find/www/smashers.png",
    "revision": "70422e057f704e5c66536dc805942337"
  },
  {
    "url": "lib/pouchdb/dist/pouchdb.find.min.js",
    "revision": "2b83852615582d42e189bdb3c5185441"
  },
  {
    "url": "lib/pouchdb/dist/pouchdb.fruitdown.min.js",
    "revision": "4c35e2852cf30ee2fb85cae6d2bd7e54"
  },
  {
    "url": "lib/pouchdb/dist/pouchdb.localstorage.min.js",
    "revision": "d4859fe692e31d0f337a059f45e0fc0c"
  },
  {
    "url": "lib/pouchdb/dist/pouchdb.memory.min.js",
    "revision": "e2043d3735d521a37b96395cc06e957d"
  },
  {
    "url": "lib/pouchdb/dist/pouchdb.min.js",
    "revision": "9326b91ae39da133edfc6666c54f8226"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/\.(?:png|jpg|jpeg|svg)$/, workbox.strategies.cacheFirst({ "cacheName":"images", plugins: [] }), 'GET');
