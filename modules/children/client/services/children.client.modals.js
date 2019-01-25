(function () {
  'use strict';

  angular
    .module('children.modalService')
    .factory('ModalService', ModalService);

  ModalService.$inject = ['$q', '$uibModal'];

  function ModalService($q, $uibModal) {
    var factory = {};

    factory.infoModal = function (title, desc, btnText) {
      var deferred = $q.defer();
      $uibModal.open({
        controller: 'InfoModalController',
        templateUrl: '/modules/children/client/templates/info-modal.html',
        resolve: {
          input: function () {
            return {
              desc: desc,
              title: title,
              btnText: btnText || 'ok',
              promise: deferred
            };
          }
        }
      });
      return deferred.promise;
    };

    factory.choiceModal = function(childId, childName, title, desc, btnText) {
      var deferred = $q.defer();
      $uibModal.open({
        controller: 'ChoiceModalController',
        templateUrl: '/modules/children/client/templates/choice-modal.html',
        resolve: {
          input: function () {
            return {
              childId: childId,
              childName: childName,
              desc: desc,
              title: title,
              btnText: btnText || 'ok',
              promise: deferred
            };
          }
        }
      });
      return deferred.promise;
    };

    factory.confirmModal = function(title, msg, confirm, cancel, cb, conditional) {
      var deferred = $q.defer();
      $uibModal.open({
        controller: 'ConfirmModalController',
        templateUrl: '/modules/children/client/templates/confirm-modal.html',
        resolve: {
          confirm: function() {
            return {
              cb: cb,
              msg: msg,
              title: title,
              cancel: cancel,
              confirm: confirm,
              promise: deferred,
              conditional: conditional
            };
          }
        }
      });
      return deferred.promise;
    };

    factory.progressModal = function (progressString) {
      return $uibModal.open({
        templateUrl: '/modules/children/client/templates/pouchSync.html',
        controller: 'ChildrenModalController',
        resolve: {
          progressString: progressString
        }
      }).result;
    };
    return factory;
  }
}());
