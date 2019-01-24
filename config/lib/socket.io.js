'use strict';

// Load the module dependencies
var config = require('../config'),
  path = require('path'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  cookieParser = require('cookie-parser'),
  passport = require('passport'),
  socketio = require('socket.io'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session);

// Define the Socket.io configuration method
module.exports = function (app, db) {
  var server;
  if (config.secure && config.secure.ssl === true) {
    // Load SSL key and certificate
    var privateKey = fs.readFileSync(path.resolve(config.secure.privateKey), 'utf8');
    var certificate = fs.readFileSync(path.resolve(config.secure.certificate), 'utf8');
    var caBundle;

    try {
      caBundle = fs.readFileSync(path.resolve(config.secure.caBundle), 'utf8');
    } catch (err) {
      console.log('Warning: couldn\'t find or read caBundle file');
    }

    var options = {
      key: privateKey,
      cert: certificate,
      ca: caBundle,
      //  requestCert : true,
      //  rejectUnauthorized : true,
      secureProtocol: 'TLSv1_method',
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'DHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-SHA256',
        'DHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'DHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES256-SHA256',
        'DHE-RSA-AES256-SHA256',
        'HIGH',
        '!aNULL',
        '!eNULL',
        '!EXPORT',
        '!DES',
        '!RC4',
        '!MD5',
        '!PSK',
        '!SRP',
        '!CAMELLIA'
      ].join(':'),
      honorCipherOrder: true
    };

    // Create new HTTPS Server
    server = https.createServer(options, app);
  } else {
    // Create a new HTTP server
    server = http.createServer(app);
  }
  // Create a new Socket.io server
  var io = socketio.listen(server);

  // Create a MongoDB storage object
  var mongoStore = new MongoStore({
    db: db,
    collection: config.sessionCollection
  });

  // Intercept Socket.io's handshake request
  io.use(function (socket, next) {
    // Use the 'cookie-parser' module to parse the request cookies
    cookieParser(config.sessionSecret)(socket.request, {}, function (err) {
      // Get the session id from the request cookies
      var sessionId = socket.request.signedCookies ? socket.request.signedCookies[config.sessionKey] : undefined;
      var serverToken = socket.request._query.token;

      if (!sessionId && serverToken !== 'chocolate') {
        return next(new Error('sessionId was not found in socket.request'), false);
      }
      if (serverToken === 'chocolate') {
        console.log('socket originated from server');
        sessionId = socket.request._query.sessionID;
      }
      // Use the mongoStorage instance to get the Express session information
      mongoStore.get(sessionId, function (err, session) {
        if (err) {
          return next(err, false);
        }
        if (!session) {
          return next(new Error('session was not found for ' + sessionId), false);
        }

        // Set the Socket.io session information
        socket.request.session = session;

        // Use Passport to populate the user details
        passport.initialize()(socket.request, {}, function () {
          passport.session()(socket.request, {}, function () {
            if (socket.request.user) {
              next(null, true);
            } else {
              next(new Error('User is not authenticated'), false);
            }
          });
        });
      });
    });
  });

  const csvNSP = io.of('/csvStatus');
  csvNSP.on('connect', (socket) => {
    socket.removeAllListeners();
    // console.log(`just got a connection on /csvStatus and removed all listeners`);

    // socket.on('leaveRoom', (message) => {
    //   console.log(`leaving room ${ message.room }`);
    //   csvNSP.leave(message.room);
    // });

    socket.on('room', (message) => {
      // console.log(`joining room ${ message.room } from ${ message.src }`);
      socket.join(message.room);
      if (message.src === 'client') {
        csvNSP.to(message.room).emit('Client_ready', { text: 'does this work?' });
      } else {
        csvNSP.to(message.room).emit('Server_ready', { text: 'start processing' });
      }
    });

    socket.on('CSV_progress', (message) => {
      // console.log(`emit event CSV_Progress ${ message.text } from server`);
      csvNSP.to(message.room).emit('CSV_progress', message);
    });

    socket.on('CSV_complete', (message) => {
      // console.log(`emit event CSV_complete ${ message.text } from server`);
      csvNSP.to(message.room).emit('CSV_complete', message);
    });

    socket.on('CSV_error', (message) => {
      // console.log(`send CSV_error event ${ message.text } to room ${ message.room }`);
      csvNSP.to(message.room).emit('CSV_error', message);
    });

    socket.on('disconnect', function () {
      io.emit('disconnect', {
        type: 'status',
        text: 'disconnected'
      });
      // console.log('disconnect received at the server');
      io.removeAllListeners();
    });

    socket.on('end', () => {
      socket.disconnect(true);
    });
  });

  // const adminNSP = io.of('/admin').on('connect', (socket) => {
  //   socket.on('room', (room) => {
  //     socket.join(room);
  //   });
  //
  //   socket.on('CSV_status', (message) => {
  //     io.in(message.room).emit('CSV_status', message);
  //   });
  //
  //   socket.on('disconnect', function () {
  //     io.emit('CSV_status', {
  //       type: 'status',
  //       text: 'disconnected'
  //     });
  //     console.log('disconnect received at the server');
  //     io.removeAllListeners('CSV_status');
  //   });
  //
  //   socket.on('end', () => {
  //     socket.disconnect(true);
  //   });
  // });
  // Add an event listener to the 'connection' event
  // io.on('connection', function (socket) {
  //
  //   console.log('connecting at the server');
  //   if (socket.handshake.query.name)
  //   // if (socket.)
  //   // if (socket.handshake.query.room) {
  //   //   socket.join(socket.handshake.query.room);
  //   // }
  //   socket.on('room', (room) => {
  //     socket.join(room);
  //   });
  //
  //   socket.on('CSV_status', (message) => {
  //     io.in(message.room).emit('CSV_status', message);
  //   });
  //
  //   socket.on('disconnect', function () {
  //     io.emit('CSV_status', {
  //       type: 'status',
  //       text: 'disconnected'
  //     });
  //     console.log('disconnect received at the server');
  //     io.removeAllListeners('CSV_status');
  //   });
  //
  //   socket.on('end', () => {
  //     socket.disconnect(true);
  //   });
  //   // console.log('new socket-io connection');
  //   // config.files.server.sockets.forEach(function (socketConfiguration) {
  //   //   require(path.resolve(socketConfiguration))(io, socket);
  //   // });
  // });

  return server;
};
