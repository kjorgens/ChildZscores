(function () {
  'use strict';

  // Create the Socket.io wrapper service
  angular
    .module('core')
    .factory('Socket', Socket);

  Socket.$inject = ['Authentication', '$state', '$timeout'];

  function Socket(Authentication, $state, $timeout) {
    var service = {
      connect: connect,
      connectNSP: connectNSP,
      emit: emit,
      on: on,
      removeListener: removeListener,
      close: close,
      socket: null
    };

    return service;

    // Connect to Socket.io server
    function connect(connection, query) {
      // Connect only when authenticated
      console.log(`connecting ${ connection } from the client`);
      if (Authentication.user) {
        service.socket = io(connection, query);
      }
    }

    function connectNSP(namespace) {
      console.log(`connecting to nameSpace ${ namespace } from the client`);
      service.socket = io({ query: { nsp: namespace } });
    }

    // Wrap the Socket.io 'emit' method
    function emit(eventName, data) {
      if (service.socket) {
        service.socket.emit(eventName, data);
      }
    }

    // Wrap the Socket.io 'on' method
    function on(eventName, callback) {
      if (service.socket) {
        service.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    }

    // Wrap the Socket.io 'removeListener' method
    function removeListener(eventName) {
      if (service.socket) {
        service.socket.removeListener(eventName);
      }
    }

    function close() {
      if (service.socket) {
        console.log('disconnect from the client');
        service.socket.disconnect();
        service.socket = null;
      }
    }
  }
}());
