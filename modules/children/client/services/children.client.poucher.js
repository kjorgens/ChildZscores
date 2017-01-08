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
      'surveyDate', 'firstName', 'zscoreStatus', 'lastName', 'owner',  'ward',
       'deliveryDate', 'childsBirthDate', 'lastScreening'
    ];
    factory.createDatabase = function (dbName, queryFunction, queryParams) {
      if(database && ~database.name.indexOf(dbName)){
        return queryFunction(queryParams);
      } else {
        currentDbName = dbName;
        database = pouchDB (dbName);
        return (factory.ddocFilter ().then (factory.initLocalDb ()).then (queryFunction));
      }
    };

    factory.createCountryDatabase = function () {
      countryDataBase = pouchDB('country_list');
    };

    factory.destroyDatabase = function (dbName) {
      database = pouchDB(dbName);
      database.destroy();
      database.name = '';
    };

    factory.ddocFilter = function() {
      return  $q(function(resolve,reject) {
        database.get('_design/filter_ddocs')
            .then(function (response) {
              resolve('filter found');
            }).catch(function(err) {
              database.put(
              {
                _id: '_design/filter_ddocs',
                filters:
                    {
                      'ddocs': 'function(doc, req) {if(doc._id[0] != \'_\') {return true} else {return false}  }'
                    }
              }).then(function(response) {
            console.log('filter created');
            resolve('filter created');
          }).catch(function(err) {
            console.log(err.message);
            reject(err.message);
          });
        });
      })
    };

    factory.initLocalDb = function() {
       var indexFunctions = [];
       angular.forEach (pouchIndexes, function (index) {
         indexFunctions.push (database.createIndex ({index: {fields: [index]}}));
       });
       return ($q.all(indexFunctions));
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

    factory.createIndex = function (indexName, callback, errCallback) {
      return database.createIndex(
          { index:
              {
                fields: [indexName]
              }
          }
      );
    };

    factory.queryByWardPromise = function (wardId) {
      var findObj = {
        selector: { ward: { $eq: wardId } },
      };
      return database.find(findObj);
    };

    factory.queryByWard = function (wardName, callback, errorCallBack) {
      var findObj = {
        selector: {
          ward: { $eq: wardName },
          firstName: { $gt: null }
        },
        // sort: ['firstName']
      };
      return database.find(findObj)
          .then(function(response) {
            callback(response);
          })
          .catch(function(error) {
            errorCallBack(error);
          });
    };

    factory.findChildren = function () {
        var params = {
          selector: {lastScreening: {$gt: null}},
        };
        return database.find (params);
    };

    factory.findPregnantWomen = function () {
      var params = {
        selector: { deliveryDate: { $exists: true } }
      };
      return database.find(params);
    };

    factory.findNursingMothers = function () {
      var params = {
        selector: { childsBirthDate: { $gt: null } }
      };
      return database.find(params);
    };

    factory.queryChildren = function (callback, callbackError) {
      return database.find({
        selector: { firstName: { $gt: null } },
        // sort: ['firstName']
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

    // factory.getByStatus = function (status, callback, callbackError) {
    //   return database.find({
    //     selector: {
    //       owner: { $eq: childId },
    //       surveyDate: { $gt: null }
    //     },
    //     sort: [{ surveyDate: 'desc' }]
    //   })
    //       .then(function (response) {
    //         // Do something with the response
    //         callback(response);
    //       })
    //       .catch(function (error) {
    //         // Do something with the error
    //         callbackError(error);
    //       });
    // };

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

    factory.getOneChild = function (doc) {
      return database.get(doc.childId);
    };

    factory.getOneMother = function (doc) {
      return database.get(doc.motherId);
    };

    // factory.getOne = function (doc) {
    //   database.get(doc.childId)
    //       .then(function (response) {
    //         // Do something with the response
    //         return response;
    //       })
    //       .catch(function (error) {
    //         // Do something with the error
    //       })
    //       .finally(function () {
    //         // Do something when everything is done
    //       });
    // };

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

    function calculateStatus(screeningObj) {
      return new Promise(function(resolve, reject) {
        var zscoreStatus = '';
        if (screeningObj.zScore.wl < -2) {
          zscoreStatus = 'Acute: supplements required';
        } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 6 && screeningObj.monthAge < 36) {
          zscoreStatus = 'Acute: supplements required';
        } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 36 && screeningObj.monthAge < 48) {
          zscoreStatus = 'Micro nutrients required';
        } else if (screeningObj.zScore.ha < -1 ||
            screeningObj.zScore.wa < -1 ||
            screeningObj.zScore.wl < -1) {
          zscoreStatus = 'At Risk: Come to next screening';
        } else {
          zscoreStatus = 'Normal';
        }
        resolve({ screeningObj: screeningObj, zscoreStatus: zscoreStatus });
      });
    }

    function statusColor(status) {
      if (status.indexOf('Acute') > -1) {
        return 'redZoneZscore';
      } else if (status.indexOf('Micro') > -1) {
        return 'redZoneZscore';
      } else if (status.indexOf('Risk') > -1) {
        return 'marginalZscore';
      } else {
        return 'normalZscore';
      }
    }

    function updateChildRecord(input) {
      return new Promise(function(resolve, reject) {
        database.get(input.screeningObj.owner)
            .then(function (response) {
              var childObj = response;
              if (childObj.lastScreening !== input.screeningObj._id) {
                childObj.zscoreStatus = input.zscoreStatus;
                childObj.lastScreening = input.screeningObj._id;
                childObj.statusColor = statusColor(input.zscoreStatus);
              } else {
                childObj.zscoreStatus = input.zscoreStatus;
                childObj.statusColor = statusColor(input.zscoreStatus);
              }
              resolve(database.put(childObj));
            })
            .catch(function (error) {
              // Do something with the error
              reject(error);
            })
            .finally(function () {
              // Do something when everything is done
            });
      });
    }

    function getScreeningInfo(parmObj) {
      return new Promise(function(resolve, reject) {
        resolve(database.get(parmObj.screening));
      });
    }

    factory.calcSurveyStatus = function(screeningObj){
      var zscoreStatus = '';

      if (screeningObj.zScore.wl < -2) {
        zscoreStatus = 'redZoneZscoreBackground';
      } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 6 && screeningObj.monthAge < 36) {
        zscoreStatus = 'redZoneZscoreBackground';
      } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 36 && screeningObj.monthAge < 48) {
        zscoreStatus = 'redZoneZscoreBackground';
      } else if (screeningObj.zScore.ha < -1 ||
          screeningObj.zScore.wa < -1 ||
          screeningObj.zScore.wl < -1) {
        zscoreStatus = 'marginalZscoreBackground';
      } else {
        zscoreStatus = 'normalZscoreBackground';
      }
      return zscoreStatus;
    };

    factory.statusColor = function(status){
      return statusColor(status);
    };

    factory.statusColorBackground = function(status){
      return statusColorBackground(status);
    };

    factory.addScreening = function (screening, childId, callBack, errCallback) {
      getScreeningInfo({ screening: screening.id, child: childId })
            .then(calculateStatus)
            .then(updateChildRecord)
            .then(callBack).catch(function(err) {
              console.log(err);
            });
    };

    factory.updateScreening = function (screening, childId, callBack, errCallback) {
      getScreeningInfo({ screening: screening.id, child: childId })
          .then(calculateStatus)
          .then(updateChildRecord)
          .then(callBack).catch(function(err) {
            console.log(err);
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

    factory.updateMother = function (motherInfo, callback, errorCallback) {
      //     childInfo._id = uuid4.generate ();
      database.put(motherInfo)
          .then(function (response) {
            callback(response);
          })
          .catch(function (error) {
            errorCallback(error);
          })
          .finally(function () {
            // Do something when everything is done
          });
    };

    factory.newSyncTo = function(upStreamDb, callback, errorCallback) {
      database.replicate.to(upStreamDb, { filter: 'filter_ddocs/ddocs' })
        .on('change', function (info) {
          console.log('change sync up');
        }).on('paused', function (err) {
          console.log('sync up paused');
        // replication paused (e.g. replication up to date, user went offline)
        }).on('active', function () {
        // replicate resumed (e.g. new changes replicating, user went back online)
        }).on('denied', function (err) {
          console.log('failure to replicate on sync up');
        // a document failed to replicate (e.g. due to permissions)
        }).on('complete', function (response) {
          console.log('sync up complete');
          callback(response);
        }).on('error', function (err) {
          errorCallback(err);
        });
    };

    factory.newSyncFrom = function(upStreamDb, callback, errorCallback) {
      database.replicate.from(upStreamDb, { filter: 'filter_ddocs/ddocs' })
        .on('change', function (info) {
          console.log('change sync up');
        }).on('paused', function (err) {
          console.log('sync down paused');
        // replication paused (e.g. replication up to date, user went offline)
        }).on('active', function () {
        // replicate resumed (e.g. new changes replicating, user went back online)
        }).on('denied', function (err) {
          console.log('failure to replicate on sync down');
        // a document failed to replicate (e.g. due to permissions)
        }).on('complete', function (response) {
          console.log('sync down complete');
          callback(response);
        }).on('error', function (err) {
          errorCallback(err);
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

