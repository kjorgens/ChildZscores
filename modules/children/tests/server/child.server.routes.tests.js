'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  express = require(path.resolve('./config/lib/express')),
  config = require(path.resolve('./config/config'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  syncUser,
  syncCreds;

/**
 * Child routes tests
 */
describe('Children CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };
    syncCreds = {
      username: 'syncusername',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });
    // Create a new user
    syncUser = new User({
      firstName: 'SyncUser',
      lastName: 'Name',
      displayName: 'SyncUser Name',
      email: 'testsyner@test.com',
      username: syncCreds.username,
      password: syncCreds.password,
      provider: 'local'
    });
    process.env.SYNC_ENTITY = 'mobileUser:43212';
    process.env.COUCH_URL = 'database.liahonakids.org:5984/';
    done();
  });

  it('should be able to obtain sync credentials if logged in and has sync role', function (done) {
    syncUser.roles = ['user', 'sync'];

    syncUser.save(function (err) {
      should.not.exist(err);
      agent.post('/api/auth/signin')
          .send(syncCreds)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }

            // Get the userId
            var userId = signinRes.body.user._id;

            // obtain the sync creds
            agent.get('/api/children/sync')
                .set('Authorization', 'JWT ' + signinRes.body.token)
                .expect(200)
                .end(function (getSyncErr, getSyncRes) {
                  // Handle child save error
                  if (getSyncErr) {
                    return done(getSyncErr);
                  }
                  return done();
                });
          });
    });
  });


  it('should not be able to obtain sync credentials if logged in and does not have sync role', function (done) {
    user.roles = ['user'];

    user.save(function (err) {
      should.not.exist(err);
      agent.post('/api/auth/signin')
          .send(credentials)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }

            // Get the userId
            var userId = signinRes.body.user._id;

            // obtain the sync creds
            agent.get('/api/children/sync')
                .set('Authorization', 'JWT ' + signinRes.body.token)
                .expect(403)
                .end(function (getSyncErr, getSyncRes) {
                  // Handle child save error
                  if (getSyncErr) {
                    return done(getSyncErr);
                  }
                  return done();
                });
          });
    });
  });

  it('should not be able to obtain sync credentials if not logged in', function (done) {
    agent.get('/api/children/sync')
      .expect(401)
      .end(function (getSyncErr, childSaveRes) {
        // Call the assertion callback
        done(getSyncErr);
      });
  });

  it('should be able to get a list of stakes if not signed in', function (done) {
    // obtain the stake list
    agent.get('/api/children/stakes')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (getSyncErr, getSyncRes) {
          // Handle child save error
          if (getSyncErr) {
            return done(getSyncErr);
          } else {
       //     getSyncRes.body.should.be.instanceof(Object);
            return done();
          }
        });
  });
});
