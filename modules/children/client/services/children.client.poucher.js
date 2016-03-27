(function () {
  'use strict';

/* jshint newcap: false*/
  angular
    .module('children.pouchService')
    .factory('PouchService', PouchService);

  PouchService.$inject = ['pouchDB', 'uuid4'];

  function PouchService(pouchDB, uuid4) {
    var factory = {};
    var database;
    factory.createDatabase = function (dbName) {
      database = new pouchDB (dbName);
    };

    factory.createIndex = function (indexName) {
      database.createIndex({
        index: {
          fields: [indexName]
        }
      }).then(function (result) {
        var theResult = result;
      }).catch(function (err) {
        var error = err;
      });
    };

    factory.queryChildPromise = function () {
      return database.find({
        selector: { firstName: { $gt: null } },
        //       selector: { firstName: 'Berty' }
        //       fields: ['_id', 'lastName']
        sort: ['firstName']
      });
    };

    factory.queryChildren = function (callback, callbackError) {
      return database.find({
        selector: { firstName: { $gt: null } },
        // selector: { firstName: 'Bobby' },
 //       fields: ['_id', 'lastName']
        sort: ['firstName']
      })
      .then(function (response) {
            // Do something with the response
        callback(response);
      })
      .catch(function (error) {
            // Do something with the error
        callbackError(error);
      });
    };

    factory.getSurveys = function (childId, callback, callbackError) {
      return database.find({
        selector: {
          owner: { $eq: childId },
          surveyDate: { $gt: null }
        },
        sort: [{ surveyDate: 'desc' }]
      })
      .then(function (response) {
            // Do something with the response
        callback(response);
      })
      .catch(function (error) {
          // Do something with the error
        callbackError(error);
      });
    };

    factory.destroyDatabase = function (dbName) {
      database.destroy(dbName);
    };

    factory.getAll = function (callback, errCallback) {
      database.allDocs({ include_docs: true, attachments: true })
          .then(function (response) {
            callback(response.rows);
          })
          .catch(function (error) {
            errCallback(error);
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.remove = function (doc, callBack, errorCallback) {
      database.remove(doc)
          .then(function (response) {
            // Do something with the response
            callBack(response);
          })
          .catch(function (error) {
            // Do something with the error
            errorCallback(error);
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.get = function (doc, callBack, errCallback) {
      database.get(doc.childId)
          .then(function (response) {
            // Do something with the response
            callBack(response);
          })
          .catch(function (error) {
            // Do something with the error
            errCallback(error);
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.getOnePromise = function (doc) {
      return database.get(doc.childId);
    };

    factory.getOne = function (doc) {
      database.get(doc.childId)
          .then(function (response) {
            // Do something with the response
            return response;
          })
          .catch(function (error) {
            // Do something with the error
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.query = function (qFunction, callback, errorCallback) {
      database.query(qFunction)
          .then(function (response) {
            // Do something with the response
            callback(response.doc);
          })
          .catch(function (error) {
            // Do something with the error
            errorCallback(error);
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.insertSurvey = function (childInfo, callback, errorCallback) {
      database.put(childInfo)
          .then(function (response) {
            // Do something with the response
            callback(response);
          })
          .catch(function (error) {
            // Do something with the error
            errorCallback(error);
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.insert = function (childInfo, callback, errorCallback) {
      childInfo._id = childInfo._id || uuid4.generate();
      if (childInfo._rev) {
        childInfo._rev = childInfo._rev;
      }
      database.put(childInfo)
          .then(function (response) {
            // Do something with the response
            callback(response);
          })
          .catch(function (error) {
            // Do something with the error
            errorCallback(error);
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.updateChild = function (childInfo) {
 //     childInfo._id = uuid4.generate ();
      database.put(childInfo)
          .then(function (response) {
            // Do something with the response
            return response;
          })
          .catch(function (error) {
            // Do something with the error
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.sync = function (upStreamDb, callback, errorCallback, nextState) {
      database.sync(upStreamDb).$promise
      .then(function (response) {
        // Do something with the response
        callback(response);
      })
      .catch(function (error) {
        // Do something with the error
        errorCallback(error);
      })
      .finally(function () {
        nextState();
        // Do something when everything is done
      });
    };

    factory.replicate = function (upStreamDb, callback, errorCallback, whenDone) {
      database.replicate.to(upStreamDb)
          .then(function (response) {
            // Do something with the response
            callback(response);
          })
          .catch(function (error) {
            // Do something with the error
            errorCallback(error);
          })
          .finally(function () {
            whenDone();
          });
    };
    return factory;
  }
}());

