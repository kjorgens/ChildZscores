// (function () {
//   'use strict';
//
//   angular
//     .module('children.modalService')
//     .factory('ModalService', ModalService);
//
//   ModalService.$inject = ['$q', '$log', '$uibModal'];
//
//   function ModalService($q, $log, $uibModal) {
//     var factory = {};
//
//     factory.progressModal = function (progressString) {
//       return $uibModal.open({
//         templateUrl: 'modules/children/client/templates/pouchSync.html',
//         controller: 'ChildrenModalController',
//         resolve: {
//           progressString: progressString
//         }
//       }).result;
//     };
//     return factory;
//   }
// }());

