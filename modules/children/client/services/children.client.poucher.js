(function () {
  'use strict';

/* jshint newcap: false*/
  angular
    .module('children.pouchService')
    .factory('PouchService', PouchService);

  PouchService.$inject = ['$q', 'pouchDB', 'uuid4', 'moment'];

  function PouchService($q, pouchDB, uuid4, moment) {
    var factory = {};
    var database;
    var countryDataBase;
    var remoteDbList;
    var localDbList;
    var currentDbName;

    factory.createDatabase = function (dbName) {
      currentDbName = dbName;
      database = new pouchDB (dbName);
    };

    factory.createCountryDatabase = function () {
      countryDataBase = new pouchDB ('country_list');
    };

    factory.initLocalDb = function(indexNames) {
      var deferred = $q.defer();
      var indexFunctions = [];
      angular.forEach(indexNames, function(index) {
        indexFunctions.push(database.createIndex({ index: { fields: [index] } }));
      });
      $q.all(indexFunctions)
      .then(
          function(results) {
            deferred.resolve(results);
          },
          function(errors) {
            deferred.reject(errors);
          },
          function(updates) {
            deferred.update(updates);
          });
      return deferred.promise;
    };

    factory.getAllDbsLocal = function(callback) {
      PouchDB.allDbs(function(err, dbs) {
        if (err) {
          var error = err;
        }
        callback(dbs);
      });
    };

    factory.putStakesLocal = function (countryObj, callback, errCallback) {
      var newObj = {};
      countryDataBase.get('liahona_kids_countries_stakes')
          .then(function (response) {
            newObj._id = response._id;
            newObj._rev = response._rev;
            newObj.countries = countryObj.countries;
            countryDataBase.put(newObj)
                .then(function (response) {
                  // Do something with the response
                  callback(response);
                })
                .catch(function (error) {
                  // Do something with the error
                  errCallback(error);
                })
                .finally(function () {
                  // Do something when everything is done
                });
          })
          .catch(function (error) {
            newObj._id = 'liahona_kids_countries_stakes';
            newObj.countries = countryObj.countries;
            countryDataBase.put(newObj)
                .then(function (response) {
                  // Do something with the response
                  callback(response);
                })
                .catch(function (error) {
                  // Do something with the error
                  errCallback(error);
                })
                .finally(function () {
                  // Do something when everything is done
                });
          });
    };

    factory.getCountriesLocal = function (callback, errCallback) {
      countryDataBase.get('liahona_kids_countries_stakes')
      // countryDataBase.allDocs({ include_docs: true, attachments: true })
      .then(function (response) {
      // Do something with the response
        callback(response);
      })
      .catch(function(error) {
      // Do something with the error
        errCallback(error);
      });
    };

    // factory.getDbListRemote = function (callback, errorCallback, nextState) {
    //   countryDataBase.sync('https://syncuser:mZ7K3AldcIzO@database.liahonakids.org:5984/country_list').$promise
    //       .then(function (response) {
    //         // Do something with the response
    //         callback(response);
    //       })
    //       .catch(function (error) {
    //         // Do something with the error
    //         errorCallback(error);
    //       })
    //       .finally(function () {
    //         nextState();
    //         // Do something when everything is done
    //       });
    // };

    factory.createIndex = function (indexName, callback, errCallback) {
      return database.createIndex({ index: {
        fields: [indexName]
      }
      });
//      database.createIndex
      //   index: {
      //     fields: [indexName]
      //   }
      // }).then(function (result) {
      //   callback(result);
      // }).catch(function (err) {
      //   errCallback(err);
      // });
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

    // factory.destroyDatabase = function (dbName) {
    //   database = new pouchDB (dbName);
    //   database.destroy();
    // };

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
      childInfo._id = childInfo._id || currentDbName + '_' + moment.now();
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

