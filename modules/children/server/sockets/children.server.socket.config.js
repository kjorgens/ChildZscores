'use strict';

// Create the chat configuration
module.exports = function (io, socket) {
  // Emit the status event when a new socket client is connected
  console.log('new socket connection added at server');

  // if (socket.handshake.query.nameSpace) {
  // console.log(`adding nsp /${ socket.handshake.query.nsp }`);
  var nsp = io.of('/csvStatus');

  // nsp.on('connection', (socket) => {
  //   console.log(`something connected on /${ socket.handshake.query.room }`);
  //   nsp.emit('CSV_status', { message: `connecting to /csvStatus joining room ${ socket.handshake.query.room }` });
  //   socket.join(socket.handshake.query.room);
  // });
  // }

  // if (socket.handshake.room) {
  //   socket.join(socket.handshake.query.room);
  // }
  // io.emit('', {
  //   type: 'status',
  //   text: 'Is now ready'
  // });
  nsp.on('CSV_status', (message) => {
    console.log(`namespace CSV_status in room${ message.room } message received server and emitted`);
    // nsp.emit('CSV_status', message);
    io.sockets.in(message.room).emit(message);
  });

  // socket.on('CSV_status', function (message) {
  //   console.log(`CSV_status message ${ message.text } received server and emitted`);
  //   io.emit('CSV_status', message);
  // });

  // Emit the status event when a socket client is disconnected
  nsp.on('disconnect', function () {
    io.emit('CSV_status', {
      type: 'status',
      text: 'disconnected'
    });
    console.log('disconnect received at the server');
    io.removeAllListeners('CSV_status');
  });

  nsp.on('end', () => {
    socket.disconnect(true);
  });
};
