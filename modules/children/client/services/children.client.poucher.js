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
    var pouchIndexes = [
      'firstName', 'lastName', 'owner', 'surveyDate', 'ward'
    ];
    factory.createDatabase = function (dbName) {
      currentDbName = dbName;
      database = new pouchDB(dbName);
    };

    factory.createCountryDatabase = function () {
      countryDataBase = new pouchDB('country_list');
    };

    factory.destroyDatabase = function (dbName) {
      database = new pouchDB (dbName);
      database.destroy();
    };

    factory.initLocalDb = function() {
      var deferred = $q.defer();
      var indexFunctions = [];
      angular.forEach(pouchIndexes, function(index) {
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

    // factory.getAllDbsLocal = function(callback) {
    //   pouchDB.allDbs(function(err, dbs) {
    //     if (err) {
    //       var error = err;
    //     }
    //     callback(dbs);
    //   });
    // };

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

    factory.getWardList = function (countryName, stakeName, callback, errCallback) {
      countryDataBase.get('liahona_kids_countries_stakes')
          .then(function (response) {
            response.countries.forEach(function(country) {
              if (country.name.indexOf(countryName) > -1) {
                country.stakes.forEach(function(stake) {
                  if (stake.stakeName.indexOf(stakeName) > -1) {
                    if (stake.wards !== undefined) {
                      callback(stake.wards);
                    } else {
                      callback(null);
                    }
                  } else {
                    callback(null);
                  }
                });
              } else {
                callback(null);
              }
            });
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
      var findObj = {
        selector: { firstName: { $gt: null } },
        sort: ['firstName']
      };
      return (factory.initLocalDb().then(database.find(findObj)));
 //     return database.find(findObj);
    };

    factory.queryByWardPromise = function (wardId) {
      var findObj = {
        selector: { ward: { $eq: wardId } },
        sort: ['firstName']
      };
      return database.find(findObj);
    };

    factory.queryByWard = function (wardName, callback, errorCallBack) {
      var findObj = {
        selector: {
          ward: { $eq: wardName },
          firstName: { $gt: null }
        },
        sort: ['firstName']
      };
      return database.find(findObj)
          .then(function(response) {
            callback(response);
          })
          .catch(function(error) {
            errorCallBack(error);
          });
    };
    factory.queryChildren = function (callback, callbackError) {
      return database.find({
        selector: { firstName: { $gt: null } },
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

    factory.addScreening = function (screening, childId, callBack, errCallback) {
      database.get(childId)
          .then(function (response) {
            var childObj = response;
            childObj.lastScreening = screening;
            database.put(childObj).then(callBack(childObj));
          })
          .catch(function (error) {
            // Do something with the error
            errCallback(error);
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.insert = function (childInfo, callback, errorCallback) {
      if (childInfo._id.length <= 5) {
        childInfo._id = childInfo._id + currentDbName + '_' + moment.now();
      }

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

    factory.longSync = function(localDB, remoteDB) {
      var sync = PouchDB.sync(localDB, remoteDB, {
        live: true,
        retry: true
      }).on('change', function (info) {
        console.log(info);
        // handle change
      }).on('paused', function (err) {
        console.log('Sync Paused ' + err);
        // replication paused (e.g. replication up to date, user went offline)
      }).on('active', function () {
        console.log('Sync resumed');
        // replicate resumed (e.g. new changes replicating, user went back online)
      }).on('denied', function (err) {
        console.log('Denied error ' + err);
        // a document failed to replicate (e.g. due to permissions)
      }).on('complete', function (info) {
        console.log('Sync Complete');
        // handle complete
      }).on('error', function (err) {
        console.log('Sync Error ' + err);
        // handle error
      });
    }

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

