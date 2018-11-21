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

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

workbox.core.setCacheNameDetails({prefix: "liahonaKids"});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "chat/client/chat.client.module.js",
    "revision": "f238495044beef9576bd0d149c1adf35"
  },
  {
    "url": "chat/client/config/chat.client.config.js",
    "revision": "d949b310618d1218b22d11dca4f75d1c"
  },
  {
    "url": "chat/client/config/chat.client.menus.js",
    "revision": "e0e8e9cf61673375e3d8c20bdf1c1b53"
  },
  {
    "url": "chat/client/config/chat.client.routes.js",
    "revision": "ce7da92cc5d33936b0628643fdbb88a5"
  },
  {
    "url": "chat/client/controllers/chat.client.controller.js",
    "revision": "6d7fae4f7c1ff486d116b5c0dbb94f7b"
  },
  {
    "url": "children/client/children.client.module.js",
    "revision": "648be57c32b73cb7c772c60f7e6c1110"
  },
  {
    "url": "children/client/config/children.client.config.js",
    "revision": "9ff9503cdad36312cbf2000a2638dc7d"
  },
  {
    "url": "children/client/config/children.client.menus.js",
    "revision": "d455dc25bb069cc854c75488eaf930c9"
  },
  {
    "url": "children/client/config/children.client.pouchconfig.js",
    "revision": "8971778a9cc0ad74eeea6d9ed8a7b87f"
  },
  {
    "url": "children/client/config/children.client.routes.js",
    "revision": "363d2abb55d3d9a3159e0fee738e7702"
  },
  {
    "url": "children/client/config/children.spinner.config.js",
    "revision": "cbeb8d5b44750a1f073ceb4340b788ad"
  },
  {
    "url": "children/client/config/children.translate.config.js",
    "revision": "ac674e5078564624beddcbfd9ebed058"
  },
  {
    "url": "children/client/services/children.client.filter.search.js",
    "revision": "06575f8ce95d64549320b898d4e5a081"
  },
  {
    "url": "children/client/services/children.client.graphs.js",
    "revision": "c7c7e22df51ba43e31926c19b5ed54eb"
  },
  {
    "url": "children/client/services/children.client.modals.js",
    "revision": "6acd853e6bb4f75de89af0273b42d434"
  },
  {
    "url": "children/client/services/children.client.obesity.js",
    "revision": "58c8b090af664c8b836c8841c1bfed26"
  },
  {
    "url": "config.js",
    "revision": "7368929ce8f51737a669ac0569b4da78"
  },
  {
    "url": "core/client/core.client.module.js",
    "revision": "98cdfeb9aff59e98a677d93d79d5c316"
  },
  {
    "url": "init.js",
    "revision": "2aa714ed0828a45fefe94d87a85c0991"
  },
  {
    "url": "modules/chat/client/css/chat.css",
    "revision": "94ee02d50984e671baff4f98937bf1ef"
  },
  {
    "url": "modules/chat/client/views/chat.client.view.html",
    "revision": "f1f54372990004a14e934a6f98de355e"
  },
  {
    "url": "modules/children/client/img/bolivia.png",
    "revision": "64400988ebaa8831e58449c0c73f635f"
  },
  {
    "url": "modules/children/client/img/brazil.png",
    "revision": "8d87f0b75e6668d777797615bde58466"
  },
  {
    "url": "modules/children/client/img/cambodia.png",
    "revision": "749be85badc9f0f37f053d7578f074ac"
  },
  {
    "url": "modules/children/client/img/columbia.png",
    "revision": "656835a22f4f29e61a115600b5b23614"
  },
  {
    "url": "modules/children/client/img/ecuador.png",
    "revision": "1313bff2394ceb65ed68116ee4e63bbd"
  },
  {
    "url": "modules/children/client/img/ghana.png",
    "revision": "ce5941f7c0f70e290aec13191547d325"
  },
  {
    "url": "modules/children/client/img/guatamala.png",
    "revision": "29fdb15aa8abe43acdc0291d0112a1b4"
  },
  {
    "url": "modules/children/client/img/haiti.png",
    "revision": "adbb31ccf4587ee598a1628705d38a72"
  },
  {
    "url": "modules/children/client/img/honduras.png",
    "revision": "6a92a845c8b8145e98730dbd39d0af46"
  },
  {
    "url": "modules/children/client/img/kiribati.png",
    "revision": "b1de709f24a43364aa676fcd78c6e92a"
  },
  {
    "url": "modules/children/client/img/madagascar.png",
    "revision": "db788bc8615dadfce4df8e73442c3af0"
  },
  {
    "url": "modules/children/client/img/mongolia.png",
    "revision": "b86a54f2cfcccf6cb091b9dfbd10896d"
  },
  {
    "url": "modules/children/client/img/nicaragua.png",
    "revision": "2d9334dd43a4d004de348f0d27d84193"
  },
  {
    "url": "modules/children/client/img/paraguay.png",
    "revision": "b7a464896e0d7ecdc7e25eca7cc2c90c"
  },
  {
    "url": "modules/children/client/img/peru.png",
    "revision": "bf9a5914296c24c2f1471b34c5114c53"
  },
  {
    "url": "modules/children/client/img/philippines.png",
    "revision": "dba41a094a1aaa5da11dbed6666ec226"
  },
  {
    "url": "modules/children/client/img/salvador.png",
    "revision": "99719728bf60db9cd97e2a3cc5935a2b"
  },
  {
    "url": "modules/children/client/img/sierraleone.png",
    "revision": "06bb9c9827e0b21110f7c6226662341a"
  },
  {
    "url": "modules/children/client/img/venezuela.png",
    "revision": "105be1cff279dd1e1acc44455a428247"
  },
  {
    "url": "modules/children/client/img/zimbabwe.png",
    "revision": "75a062d2ebe6c949046ac06c21810f97"
  },
  {
    "url": "modules/children/client/templates/choice-modal.html",
    "revision": "64ec01b7e2b5a7793bb71be0d9458fa8"
  },
  {
    "url": "modules/children/client/templates/confirm-modal.html",
    "revision": "1a8c42e603c245b95b908864fff6297c"
  },
  {
    "url": "modules/children/client/templates/info-modal.html",
    "revision": "414a928bf9c00485e3e74bb76d47f876"
  },
  {
    "url": "modules/children/client/templates/messageModal.html",
    "revision": "bd941ac743cfa71c72a8427af0554ddb"
  },
  {
    "url": "modules/children/client/templates/modal.html",
    "revision": "27f2ae5838bebed2298d01e9e7c6bb5f"
  },
  {
    "url": "modules/children/client/templates/pouchSync.html",
    "revision": "717e59d6b2d44b558878f29520079ad2"
  },
  {
    "url": "modules/children/client/views/add-survey.client.view.html",
    "revision": "5459d48b7419419b79e00c076201a4b8"
  },
  {
    "url": "modules/children/client/views/country.client.view.html",
    "revision": "93393bccdf70fa8ef1a2b5fe27ec5e0b"
  },
  {
    "url": "modules/children/client/views/form-child.client.view.html",
    "revision": "58029d22b2dc93f0f7ff9ec1ff58d4a4"
  },
  {
    "url": "modules/children/client/views/form-mother.client.view.html",
    "revision": "2e71dd37210737ce4d906179cd52dd82"
  },
  {
    "url": "modules/children/client/views/list-children.client.view.html",
    "revision": "5dee2d9786ffe5c4fc00b391bc92c3dd"
  },
  {
    "url": "modules/children/client/views/list-mothers.client.view.html",
    "revision": "aba9ee307b92f66619ed8aab7abb0510"
  },
  {
    "url": "modules/children/client/views/remove-child.client.view.html",
    "revision": "30d709688daa810c86e1f8093cff1783"
  },
  {
    "url": "modules/children/client/views/remove-screening.client.view.html",
    "revision": "43e2afbb92158b4c4a220ac6ad8af707"
  },
  {
    "url": "modules/children/client/views/stakes.client.view.html",
    "revision": "21625fda04dfa3d91549897e2cf94dd6"
  },
  {
    "url": "modules/children/client/views/sync-children.client.view.html",
    "revision": "2d984c9044e51459e055cd42278d4ab4"
  },
  {
    "url": "modules/children/client/views/view-child.client.view.html",
    "revision": "6ecd105108c06456c1f2585e268bd8f9"
  },
  {
    "url": "modules/core/client/css/core.css",
    "revision": "cedb48d3e1c5df81b5834a3f4189bc54"
  },
  {
    "url": "modules/core/client/img/brand/favicon.ico",
    "revision": "953e0370a3140a1ae01a1472e5c9bc75"
  },
  {
    "url": "modules/core/client/img/brand/faviconold.ico",
    "revision": "f28fab3146b2b8b581ab50c78e2d9446"
  },
  {
    "url": "modules/core/client/img/brand/logo_small.png",
    "revision": "6e6f3230637fd08c5523110911a6aac6"
  },
  {
    "url": "modules/core/client/img/brand/logo.png",
    "revision": "56221ec4ec667915980e37d616bed1c1"
  },
  {
    "url": "modules/core/client/img/buttons/facebook.png",
    "revision": "c700b78c7765325ace1cf5bbb13002e0"
  },
  {
    "url": "modules/core/client/img/buttons/github.png",
    "revision": "25f8c006e1d3f26cc305138cbc4e0ce5"
  },
  {
    "url": "modules/core/client/img/buttons/google.png",
    "revision": "34954b21234f63ef7bdab7e8ba3e6ec2"
  },
  {
    "url": "modules/core/client/img/buttons/linkedin.png",
    "revision": "15b19cc4e4104eb3f37426161698fa94"
  },
  {
    "url": "modules/core/client/img/buttons/paypal.png",
    "revision": "6de60420af4b8cfea3b07eb9d7318de4"
  },
  {
    "url": "modules/core/client/img/buttons/twitter.png",
    "revision": "d80337d3ccbb454843d514c0dcb4bc0c"
  },
  {
    "url": "modules/core/client/img/profile/default.png",
    "revision": "02e09323f1cb09a6d3fcd4f16aab0cc5"
  },
  {
    "url": "modules/core/client/views/400.client.view.html",
    "revision": "b7a94e2f07f4e355a35a9065c8adce8b"
  },
  {
    "url": "modules/core/client/views/403.client.view.html",
    "revision": "272bfcf2f4ce0d3e18bb3e79ffac17eb"
  },
  {
    "url": "modules/core/client/views/404.client.view.html",
    "revision": "e4a50aee187c90fceda0ed3371fed136"
  },
  {
    "url": "modules/core/client/views/500.client.view.html",
    "revision": "4993c2d2d3a1b31dd888f7b2d8ef4eb2"
  },
  {
    "url": "modules/core/client/views/chromeonly.client.view.html",
    "revision": "1996de9e69c1c9800bc9890344281f73"
  },
  {
    "url": "modules/core/client/views/header.client.view.html",
    "revision": "3b23f03ddd3e8d1f9a17b893a9a6c25f"
  },
  {
    "url": "modules/core/client/views/home.client.view.html",
    "revision": "44ca1fd290c24cee0c80a6504ae08cb4"
  },
  {
    "url": "modules/core/client/views/syncerror.client.view.html",
    "revision": "55ee80c7a935629d7d0c0bf5827e02f6"
  },
  {
    "url": "modules/core/server/views/404.server.view.html",
    "revision": "f05701b67bec5e8310bbcd2505de8e15"
  },
  {
    "url": "modules/core/server/views/500.server.view.html",
    "revision": "04bcada97fdcc2be3d92910526e41cb1"
  },
  {
    "url": "modules/core/server/views/index.server.view.html",
    "revision": "aa9bead3040f167a8d84b2594cd2d85a"
  },
  {
    "url": "modules/core/server/views/layout.server.view.html",
    "revision": "217fd46dddcbbe94fec818ef319e4f3a"
  },
  {
    "url": "modules/users/client/css/users.css",
    "revision": "94999f4c00ec800db92bb0f4e29059d6"
  },
  {
    "url": "modules/users/client/img/profile/default.png",
    "revision": "02e09323f1cb09a6d3fcd4f16aab0cc5"
  },
  {
    "url": "modules/users/client/views/admin/edit-user.client.view.html",
    "revision": "0c1285dee92f90d8df3ff47a2c9db4d1"
  },
  {
    "url": "modules/users/client/views/admin/list-users.client.view.html",
    "revision": "5b34fc40c253e2a3fb98cbf40d17a633"
  },
  {
    "url": "modules/users/client/views/admin/view-user.client.view.html",
    "revision": "cdcde5c8a32aaf3ce54cd92512c58998"
  },
  {
    "url": "modules/users/client/views/authentication/authentication.client.view.html",
    "revision": "c1151158ec9b467c179444c42bb16ee6"
  },
  {
    "url": "modules/users/client/views/authentication/signin.client.view.html",
    "revision": "9ddf512d2802278054b76fee968890a3"
  },
  {
    "url": "modules/users/client/views/authentication/signup.client.view.html",
    "revision": "08714ee0b16766fb8e203329e173ca6b"
  },
  {
    "url": "modules/users/client/views/password/forgot-password.client.view.html",
    "revision": "ba5a598d48843769ee90a83de36ce445"
  },
  {
    "url": "modules/users/client/views/password/reset-password-invalid.client.view.html",
    "revision": "1c191fb50c1f0e8bcfcba00507a449a7"
  },
  {
    "url": "modules/users/client/views/password/reset-password-success.client.view.html",
    "revision": "390ff4ef21868f06cd3cfe2d8ce1aca7"
  },
  {
    "url": "modules/users/client/views/password/reset-password.client.view.html",
    "revision": "ea750f652b955af1e0bf9bc9481ae324"
  },
  {
    "url": "modules/users/client/views/settings/change-password.client.view.html",
    "revision": "920b8293e1d02ed7d598746c65a6eb08"
  },
  {
    "url": "modules/users/client/views/settings/change-profile-picture.client.view.html",
    "revision": "6c4b164918e5f83010ab5c60cf0d91b6"
  },
  {
    "url": "modules/users/client/views/settings/edit-profile.client.view.html",
    "revision": "c3219a76183b7ac27d35de7c4f78e457"
  },
  {
    "url": "modules/users/client/views/settings/manage-social-accounts.client.view.html",
    "revision": "1f395d1e50cfead2cebdc5996a47922e"
  },
  {
    "url": "modules/users/client/views/settings/settings.client.view.html",
    "revision": "d6c61a0ef9d131ceaca73fefb157b79b"
  },
  {
    "url": "modules/users/server/templates/reset-password-confirm-email.server.view.html",
    "revision": "21b6166965a2eeb51d25d6e61c94dfaa"
  },
  {
    "url": "modules/users/server/templates/reset-password-email.server.view.html",
    "revision": "2b335071270bcb06e04d7726ce912d5e"
  },
  {
    "url": "public/dist/application.min.css",
    "revision": "cec58fb205a040e92db84a9e981f4a48"
  },
  {
    "url": "public/dist/application.min.js",
    "revision": "0fa1bd5902bb211d36cfbbbbf41de20b"
  },
  {
    "url": "public/lib/angular-animate/angular-animate.min.js",
    "revision": "fb4ae45e62f1c6956679f4711c225b80"
  },
  {
    "url": "public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js",
    "revision": "505c5211f870df73aa8198286cb9c001"
  },
  {
    "url": "public/lib/angular-bootstrap/ui-bootstrap.min.js",
    "revision": "7f90edcb4b484980d220ea1ccde8334f"
  },
  {
    "url": "public/lib/angular-file-upload/dist/angular-file-upload.min.js",
    "revision": "8e334aa0539982ed4df1c4a1e0767330"
  },
  {
    "url": "public/lib/angular-messages/angular-messages.min.js",
    "revision": "cff1a9ee16c066e59fe10de0ef098c6d"
  },
  {
    "url": "public/lib/angular-moment/angular-moment.min.js",
    "revision": "5071a15982de1c5954351de2a5f1f6aa"
  },
  {
    "url": "public/lib/angular-nvd3/dist/angular-nvd3.min.js",
    "revision": "8e64d5ee7087973eb380d3eba5d4a504"
  },
  {
    "url": "public/lib/angular-pouchdb/angular-pouchdb.min.js",
    "revision": "a111f41b35f329be7ecf1d4e993e7c53"
  },
  {
    "url": "public/lib/angular-resource/angular-resource.min.js",
    "revision": "e260665695e31fb9ce9290da1d045d8c"
  },
  {
    "url": "public/lib/angular-sanitize/angular-sanitize.min.js",
    "revision": "20f5e15ab8dfe493115309a2becb3fb3"
  },
  {
    "url": "public/lib/angular-spinner/dist/angular-spinner.min.js",
    "revision": "f25d26acc2e857d981a916e17177f7c5"
  },
  {
    "url": "public/lib/angular-translate/angular-translate.min.js",
    "revision": "043ca33cd1a9b97ffbbb33671c3d38c8"
  },
  {
    "url": "public/lib/angular-ui-event/dist/event.min.js",
    "revision": "6cfec5cd8511d60422921eb41b6cedc1"
  },
  {
    "url": "public/lib/angular-ui-indeterminate/dist/indeterminate.min.js",
    "revision": "157e843f6e5dd7fc103baa64bf76ed1c"
  },
  {
    "url": "public/lib/angular-ui-mask/dist/mask.min.js",
    "revision": "af23bc21e0624b3a9696cbda8a537b3e"
  },
  {
    "url": "public/lib/angular-ui-router-uib-modal.js",
    "revision": "765dc3aa0f73b49576bd5aca2c334f9e"
  },
  {
    "url": "public/lib/angular-ui-router/release/angular-ui-router.min.js",
    "revision": "a463454adc10146059a446d7f066e183"
  },
  {
    "url": "public/lib/angular-ui-router/release/resolveService.min.js",
    "revision": "576e0e76819b154155ead26a73567cbe"
  },
  {
    "url": "public/lib/angular-ui-router/release/stateEvents.min.js",
    "revision": "a5bc3195bd52fb999a50f16096dea05a"
  },
  {
    "url": "public/lib/angular-ui-router/release/ui-router-angularjs.min.js",
    "revision": "76c7c2811133a81b876cd8065a51119b"
  },
  {
    "url": "public/lib/angular-ui-scroll/dist/ui-scroll-grid.min.js",
    "revision": "45a458d33bd04ed3a339f3ac5ef630eb"
  },
  {
    "url": "public/lib/angular-ui-scroll/dist/ui-scroll-jqlite.min.js",
    "revision": "e3ba77f424a553f22ed20a927f47a113"
  },
  {
    "url": "public/lib/angular-ui-scroll/dist/ui-scroll.min.js",
    "revision": "0f7e4d007306f7766ccedbb377da2c02"
  },
  {
    "url": "public/lib/angular-ui-scrollpoint/dist/scrollpoint.min.js",
    "revision": "7c83860af55b48b8349ac7d13e77cb59"
  },
  {
    "url": "public/lib/angular-ui-uploader/dist/uploader.min.js",
    "revision": "608d39baef083f1771ab98fe3a40e6f0"
  },
  {
    "url": "public/lib/angular-ui-validate/dist/validate.min.js",
    "revision": "39a94342da7f32cd23b8214ee99fc6e7"
  },
  {
    "url": "public/lib/angular/angular.min.js",
    "revision": "c2ad694ba54a332992cc370fafd0d367"
  },
  {
    "url": "public/lib/bootstrap/dist/js/bootstrap.min.js",
    "revision": "5869c96cc8f19086aee625d670d741f9"
  },
  {
    "url": "public/lib/d3/d3.min.js",
    "revision": "5bc245068b1b70d4c3eaef79045023e4"
  },
  {
    "url": "public/lib/jquery/dist/jquery.min.js",
    "revision": "a09e13ee94d51c524b7e2a728c7d4039"
  },
  {
    "url": "public/lib/jquery/dist/jquery.slim.min.js",
    "revision": "99b0a83cf1b0b1e2cb16041520e87641"
  },
  {
    "url": "public/lib/jquery/external/sizzle/dist/sizzle.min.js",
    "revision": "a7da9ea7bd03729fae7b8a8c7a596ed1"
  },
  {
    "url": "public/lib/moment/min/locales.min.js",
    "revision": "f5c93b5698ee2589fe9e391dfb4be10a"
  },
  {
    "url": "public/lib/moment/min/moment-with-locales.min.js",
    "revision": "a79a8710a3517e497846aca9179f8d81"
  },
  {
    "url": "public/lib/moment/min/moment.min.js",
    "revision": "8999b8b5d07e9c6077ac5ac6bc942968"
  },
  {
    "url": "public/lib/nvd3/build/nv.d3.min.js",
    "revision": "5f97dd7913869604ba2a5d796585436f"
  },
  {
    "url": "public/lib/owasp-password-strength-test.js",
    "revision": "2dc4014c1dd08e0b02265845fadd1df7"
  },
  {
    "url": "public/lib/pouchdb-all-dbs/dist/pouchdb.all-dbs.min.js",
    "revision": "4bbe09d094e5f4190071a3be756a7db4"
  },
  {
    "url": "public/lib/pouchdb-find/dist/pouchdb.find.min.js",
    "revision": "d64876ca7b85c5cf644000ca281279eb"
  },
  {
    "url": "public/lib/pouchdb-find/www/bootstrap/js/bootstrap.min.js",
    "revision": "046ba2b5f4cff7d2eaaa1af55caa9fd8"
  },
  {
    "url": "public/lib/pouchdb-find/www/jquery/jquery.min.js",
    "revision": "5790ead7ad3ba27397aedfa3d263b867"
  },
  {
    "url": "public/lib/pouchdb/dist/pouchdb.find.min.js",
    "revision": "2b83852615582d42e189bdb3c5185441"
  },
  {
    "url": "public/lib/pouchdb/dist/pouchdb.fruitdown.min.js",
    "revision": "4c35e2852cf30ee2fb85cae6d2bd7e54"
  },
  {
    "url": "public/lib/pouchdb/dist/pouchdb.localstorage.min.js",
    "revision": "d4859fe692e31d0f337a059f45e0fc0c"
  },
  {
    "url": "public/lib/pouchdb/dist/pouchdb.memory.min.js",
    "revision": "e2043d3735d521a37b96395cc06e957d"
  },
  {
    "url": "public/lib/pouchdb/dist/pouchdb.min.js",
    "revision": "9326b91ae39da133edfc6666c54f8226"
  },
  {
    "url": "public/register.js",
    "revision": "236a35ceee418d9842ab2d4252e2ead8"
  },
  {
    "url": "users/client/users.client.module.js",
    "revision": "53715ba3b8ff20d52ed8e3f0bbc62bff"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
