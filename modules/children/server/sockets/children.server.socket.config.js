'use strict';

// Create the chat configuration
module.exports = function (io, socket) {
  // Emit the status event when a new socket client is connected
  console.log('new socket connection added at server');

  // if (socket.handshake.query.nameSpace) {
  console.log(`adding nsp /${ socket.handshake.query.nsp }`);
  var nsp = io.of(`/${ socket.handshake.query.nsp }`);
  nsp.on('connection', (socket) => {
    console.log(`something connected on /${ socket.handshake.query.nameSpace }`);
    nsp.emit('CSV_status', {});
  });
  // }

  // if (socket.handshake.room) {
  //   socket.join(socket.handshake.query.room);
  // }
  // io.emit('', {
  //   type: 'status',
  //   text: 'Is now ready'
  // });
  nsp.on('CSV_status', function (message) {
    // console.log('CSV_status message received server and emitted');
    nsp.emit('CSV_status', message);
  });

  socket.on('CSV_status', function (message) {
    // console.log('CSV_status message received server and emitted');
    io.emit('CSV_status', message);
  });

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    io.emit('CSV_status', {
      type: 'status',
      text: 'disconnected'
    });
    console.log('disconnect received at the server');
    // io.removeAllListeners('CSV_status');
  });

  socket.on('end', () => {
    socket.disconnect(true);
  });
};
