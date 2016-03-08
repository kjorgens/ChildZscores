'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Child = mongoose.model('Child'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, child;

/**
 * Child routes tests
 */
describe('Child CRUD tests', function () {

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

    // Save a user to the test db and create new child
    user.save(function () {
      child = {
        title: 'Child Title',
        content: 'Child Content'
      };

      done();
    });
  });

  it('should be able to save an child if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new child
        agent.post('/api/children')
          .send(child)
          .expect(200)
          .end(function (childSaveErr, childSaveRes) {
            // Handle child save error
            if (childSaveErr) {
              return done(childSaveErr);
            }

            // Get a list of children
            agent.get('/api/children')
              .end(function (childrenGetErr, childrenGetRes) {
                // Handle child save error
                if (childrenGetErr) {
                  return done(childrenGetErr);
                }

                // Get children list
                var children = childrenGetRes.body;

                // Set assertions
                (children[0].user.id).should.equal(userId);
                (children[0].title).should.match('Child Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an child if not logged in', function (done) {
    agent.post('/api/children')
      .send(child)
      .expect(403)
      .end(function (childSaveErr, childSaveRes) {
        // Call the assertion callback
        done(childSaveErr);
      });
  });

  it('should not be able to save an child if no title is provided', function (done) {
    // Invalidate title field
    child.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new child
        agent.post('/api/children')
          .send(child)
          .expect(400)
          .end(function (childSaveErr, childSaveRes) {
            // Set message assertion
            (childSaveRes.body.message).should.match('Title cannot be blank');

            // Handle child save error
            done(childSaveErr);
          });
      });
  });

  it('should be able to update an child if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new child
        agent.post('/api/children')
          .send(child)
          .expect(200)
          .end(function (childSaveErr, childSaveRes) {
            // Handle child save error
            if (childSaveErr) {
              return done(childSaveErr);
            }

            // Update child title
            child.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing child
            agent.put('/api/children/' + childSaveRes.body._id)
              .send(child)
              .expect(200)
              .end(function (childUpdateErr, childUpdateRes) {
                // Handle child update error
                if (childUpdateErr) {
                  return done(childUpdateErr);
                }

                // Set assertions
                (childUpdateRes.body._id).should.equal(childSaveRes.body._id);
                (childUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of children if not signed in', function (done) {
    // Create new child model instance
    var childObj = new Child(child);

    // Save the child
    childObj.save(function () {
      // Request children
      request(app).get('/api/children')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single child if not signed in', function (done) {
    // Create new child model instance
    var childObj = new Child(child);

    // Save the child
    childObj.save(function () {
      request(app).get('/api/children/' + childObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', child.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single child with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/children/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Child is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single child which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent child
    request(app).get('/api/children/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No child with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an child if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new child
        agent.post('/api/children')
          .send(child)
          .expect(200)
          .end(function (childSaveErr, childSaveRes) {
            // Handle child save error
            if (childSaveErr) {
              return done(childSaveErr);
            }

            // Delete an existing child
            agent.delete('/api/children/' + childSaveRes.body._id)
              .send(child)
              .expect(200)
              .end(function (childDeleteErr, childDeleteRes) {
                // Handle child error error
                if (childDeleteErr) {
                  return done(childDeleteErr);
                }

                // Set assertions
                (childDeleteRes.body._id).should.equal(childSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an child if not signed in', function (done) {
    // Set child user
    child.user = user;

    // Create new child model instance
    var childObj = new Child(child);

    // Save the child
    childObj.save(function () {
      // Try deleting child
      request(app).delete('/api/children/' + childObj._id)
        .expect(403)
        .end(function (childDeleteErr, childDeleteRes) {
          // Set message assertion
          (childDeleteRes.body.message).should.match('User is not authorized');

          // Handle child error error
          done(childDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Child.remove().exec(done);
    });
  });
});
