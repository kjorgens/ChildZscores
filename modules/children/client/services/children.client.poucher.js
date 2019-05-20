(function () {
  'use strict';

  angular
    .module('children.pouchService')
    .factory('PouchService', PouchService);

  PouchService.$inject = ['$q', 'pouchDB', 'moment', 'ChildrenStakes', 'Obesity', 'Notification'];

  function PouchService($q, pouchDB, moment, ChildrenStakes, Obesity, Notification) {
    var factory = {};
    var database;
    var countryDataBase;
    var remoteDbList;
    var localDbList;
    var currentDbName;
    var pouchIndexes = [
      'surveyDate', 'firstName', 'zscoreStatus', 'lastName', 'owner', 'ward',
      'deliveryDate', 'childsBirthDate', 'lastScreening'
    ];

    factory.getDB = function (dbName) {
      return pouchDB(dbName);
    };

    factory.createDatabase = function (dbName, queryFunction, queryParams) {
      if (database && ~database.name.indexOf(dbName)) {
        return queryFunction(queryParams);
      } else {
        currentDbName = dbName;
        database = pouchDB(dbName);
        return (factory.ddocFilter().then(factory.initLocalDb()).then(queryFunction));
      }
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
            }).catch(function (error) {
            // Do something with the error
              errCallback(error);
            }).finally(function () {
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

    factory.createCountryDatabase = function () {
      countryDataBase = pouchDB('country_list');
    };

    factory.destroyDatabase = function (dbName) {
      database = pouchDB(dbName);
      database.destroy();
      database.name = '';
    };

    factory.ddocFilter = function () {
      return $q(function (resolve, reject) {
        database.get('_design/filter_ddocs')
          .then(function (response) {
            resolve('filter found');
          }).catch(function (err) {
            database.put({
              _id: '_design/filter_ddocs',
              filters: {
                'ddocs': 'function(doc, req) {if(doc._id[0] != \'_\') {return true} else {return false}  }'
              }
            }).then(function (response) {
              console.log('filter created');
              resolve('filter created');
            }).catch(function (err) {
              console.log(err.message);
              reject(err.message);
            });
          });
      });
    };

    factory.initLocalDb = function() {
      var indexFunctions = [];
      angular.forEach(pouchIndexes, function (index) {
        indexFunctions.push(database.createIndex({ index: { fields: [index] } }));
      });
      return ($q.all(indexFunctions));
    };

    // factory.getCountryInfoByUser = function (authUser) {
    //   if (authUser.roles.map) {
    //     if (pilot === 'phl_pilot') {
    //
    //     }
    //   }
    // };

    factory.getCountriesList = function (networkFirst) {
      return new Promise(function(resolve, reject) {
        if (navigator.onLine) {
          if (networkFirst) {
            countryDataBase = pouchDB('country_list');
            countryDataBase.info()
              .then((info) => {
                if (info.doc_count === 0 || networkFirst) {
                  console.log('get the country list from the network');
                  ChildrenStakes.getStakes()
                    .then((countries) => {
                      console.log('have the stake list from the network');
                      var docToSave = {
                        _id: 'liahona_kids_countries_stakes',
                        countries: countries.countries
                      };
                      console.log('now put the data in the local database');
                      countryDataBase.get('liahona_kids_countries_stakes')
                        .then((doc) => {
                          console.log('the database does exist locally, update it');
                          if (info.doc_count !== 0) {
                            console.log('database exists, but no document');
                            docToSave._rev = doc._rev;
                            docToSave.countries = countries.countries;
                          }
                          countryDataBase.put(docToSave).then(function (results) {
                            console.log('document is saved, resolve country list');
                            resolve(countries.countries);
                          }).catch(function (err) {
                            console.log(err);
                          });
                        }).catch((err) => {
                          console.log(err);
                          if (err.status === 404) {
                            console.log('got 404, save data and resolve');
                            countryDataBase.put(docToSave).then(function (results) {
                              resolve(countries);
                            }).catch(function (err) {
                              console.log(err);
                            });
                          }
                        });
                    });
                }
              });
          } else {
            console.log('go local first for country list');
            resolve(getCountriesLocalDB());
          }
        } else {
          console.log('go local if we are offline');
          resolve(getCountriesLocalDB());
        }
      });
    };

    function getCountriesLocalDB () {
      if (countryDataBase === undefined) {
        countryDataBase = pouchDB('country_list');
      }
      return countryDataBase.get('liahona_kids_countries_stakes')
        .then(function (response) {
          return response.countries;
        })
        .catch(function(error) {
          throw error;
        });
    }

    factory.getCountriesLocal = getCountriesLocalDB;

    /*   factory.getCountryData = function (countryName) {
      if (countryDataBase === undefined) {
        countryDataBase = pouchDB('country_list');
      }
      var toReturn = '';
      return countryDataBase.get('liahona_kids_countries_stakes')
        .then(function(countryList) {
          countryList.countries.forEach(function (country) {
            if (country.name === countryName) {
              toReturn = country;
            }
          });
          return toReturn;
        });
    };*/

    factory.getWardList = function (countryName, stakeName, callback, errCallback) {
      if (countryDataBase === undefined) {
        countryDataBase = pouchDB('country_list');
      }
      countryDataBase.get('liahona_kids_countries_stakes')
        .then(function (response) {
          response.countries.forEach(function (country) {
            if (country.name.indexOf(countryName) > -1) {
              country.stakes.forEach(function (stake) {
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
        .catch(function (error) {
          // Do something with the error
          errCallback(error);
        });
    };

    factory.createIndex = function (indexName, callback, errCallback) {
      return database.createIndex({
        index: {
          fields: [indexName]
        }
      });
    };

    factory.queryByWardPromise = function (wardId) {
      var findObj = {
        selector: { ward: { $eq: wardId } }
      };
      return database.find(findObj);
    };

    factory.queryByWard = function (wardName, callback, errorCallBack) {
      var findObj = {
        selector: {
          ward: { $eq: wardName },
          firstName: { $gt: null }
        }
        // sort: ['firstName']
      };
      return database.find(findObj).then(function(response) {
        callback(response);
      }).catch(function(error) {
        errorCallBack(error);
      });
    };

    factory.findAndFilterChildren = function() {
      var params = {
        selector: { lastScreening: { $gt: null } }
      };
      database.find(params)
        .then(fixScreenings);
    };

    factory.findChildren = function () {
      var params = {
        selector: {
          lastScreening: {
            $gt: null
          }
        }
      };
      return database.find(params);
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
        selector: { firstName: { $gt: null } }
      }).then(function (response) {
        callback(response);
      }).catch(function (error) {
        callbackError(error);
      });
    };

    factory.getScreens = function (childId) {
      return database.find({
        selector: {
          owner: { $eq: childId },
          surveyDate: { $gt: null }
        },
        sort: [{ surveyDate: 'desc' }]
      });
    };

    factory.getSurveys = function (childId, callback, callbackError) {
      return database.find({
        selector: {
          owner: { $eq: childId },
          surveyDate: { $gt: null }
        },
        sort: [{ surveyDate: 'desc' }]
      }).then(function (response) {
        callback(response);
      }).catch(function (error) {
        callbackError(error);
      });
    };

    factory.getAll = function (callback, errCallback) {
      database.allDocs({ include_docs: true, attachments: true })
        .then(function (response) {
          callback(response.rows);
        }).catch(function (error) {
          errCallback(error);
        }).finally(function () {
          // Do something when everything is done
        });
    };

    factory.remove = function (doc, callBack, errorCallback) {
      database.remove(doc).then(function (response) {
        callBack(response);
      }).catch(function (error) {
        errorCallback(error);
      }).finally(function () {
        // Do something when everything is done
      });
    };

    factory.get = function (doc, callBack, errCallback) {
      database.get(doc.childId).then(function (response) {
        callBack(response);
      }).catch(function (error) {
        errCallback(error);
      }).finally(function () {
        // Do something when everything is done
      });
    };

    factory.getChildById = function (id) {
      return database.get(id).then(function (retVal) {
        return retVal;
      }).catch(function (err) {
        console.log(err);
      });
    };

    factory.getOneChild = function (doc) {
      return database.get(doc.childId);
    };

    factory.getOneMother = function (doc) {
      return database.get(doc.motherId);
    };

    factory.query = function (qFunction, callback, errorCallback) {
      database.query(qFunction).then(function (response) {
        callback(response.doc);
      }).catch(function (error) {
        errorCallback(error);
      }).finally(function () {
        // Do something when everything is done
      });
    };

    factory.insertSurvey = function (childInfo, callback, errorCallback) {
      database.put(childInfo).then(function (response) {
        callback(response);
      }).catch(function (error) {
        errorCallback(error);
      }).finally(function () {
        // Do something when everything is done
      });
    };

    function calculateStatus(screeningObj) {
      var zscoreStatus = '';
      if (screeningObj.zScore.wl < -3) {
        zscoreStatus = 'Acute: sam supplements required';
      } else if (screeningObj.zScore.wl < -2 && screeningObj.zScore.wl > -3) {
        zscoreStatus = 'Acute: mam supplements required';
      } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 6 && screeningObj.monthAge < 36) {
        zscoreStatus = 'Acute: supplements required';
      } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 36 && screeningObj.monthAge < 48) {
        zscoreStatus = 'Micro nutrients required';
      } else if (screeningObj.zScore.ha < -1
        || screeningObj.zScore.wa < -1
        || screeningObj.zScore.wl < -1) {
        zscoreStatus = 'At Risk: Come to next screening';
      } else {
        zscoreStatus = 'Normal';
      }
      return ({ screeningObj: screeningObj, zscoreStatus: zscoreStatus });
    }

    function statusColor(status) {
      if (~status.indexOf('Acute')) {
        return 'redZoneZscore';
      } else if (~status.indexOf('Micro')) {
        return 'redZoneZscore';
      } else if (~status.indexOf('Risk')) {
        return 'marginalZscore';
      } else {
        return 'normalZscore';
      }
    }

    function updateChildRecord(input) {
      return new Promise(function (resolve, reject) {
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

    factory.calcSurveyStatus = function(screeningObj) {
      var zscoreStatus = '';

      if (screeningObj.zScore.wl < -2) {
        zscoreStatus = 'redZoneZscoreBackground';
      } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 6 && screeningObj.monthAge < 36) {
        zscoreStatus = 'redZoneZscoreBackground';
      } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 36 && screeningObj.monthAge < 48) {
        zscoreStatus = 'redZoneZscoreBackground';
      } else if (screeningObj.zScore.ha < -1
          || screeningObj.zScore.wa < -1
          || screeningObj.zScore.wl < -1) {
        zscoreStatus = 'marginalZscoreBackground';
      } else {
        zscoreStatus = 'normalZscoreBackground';
      }
      return zscoreStatus;
    };

    factory.statusColor = function(status) {
      return statusColor(status);
    };

    factory.updateChildSups = function(childId, callBack, errCallback) {
      console.log('entering UpdateChildSups');
      database.find({
        selector: {
          owner: { $eq: childId },
          surveyDate: { $gt: null }
        },
        sort: [{ surveyDate: 'desc' }]
      }).then((screenList) => {
        if (screenList.length <= 0) {
          console.log('no screens? should not be!');
        }
        var supType = 'none';
        var currentSupType = 'none';
        var priorMalnurished = 'no';
        database.get(childId)
          .then((childInfo) => {
            console.log('have the child obj');
            var currentAge = moment().diff(moment(new Date(childInfo.birthDate)), 'months');
            screenList.docs.forEach(function (screening, index) {
              console.log(screening.zScore);
              if ((screening.zScore.ha < -2 || screening.zScore.wa < -2)) {
                priorMalnurished = 'yes';
                supType = 'sup';
                if (currentAge > 36 && currentAge <= 60) {
                  supType = 'mic';
                }
              }
              if (screening.zScore.wl < -2) {
                priorMalnurished = 'yes';
                supType = 'MAM';
                if (screening.zScore.wl < -3) {
                  supType = 'SAM';
                }
              }
              if (index === 0) {
                currentSupType = supType;
              }
            });
            let timeSinceLastScreen = moment().diff(moment(new Date(screenList.docs[0].surveyDate)), 'months');
            if (timeSinceLastScreen > 6) {
              currentSupType = 'none';
            }
            childInfo.supType = currentSupType;
            const bmiInfo = Obesity.getObesity(childInfo, screenList.docs[0]);
            childInfo.bmi = bmiInfo.currentBMI;
            childInfo.obese = bmiInfo.obese;
            const statusInfo = calculateStatus(screenList.docs[0]);
            childInfo.zscoreStatus = statusInfo.zscoreStatus;
            childInfo.statusColor = statusColor(childInfo.zscoreStatus);
            childInfo.lastScreening = screenList.docs[0]._id;
            database.put(childInfo)
              .then(callBack);
          }).catch(error => {
            console.log(error.message);
          });
      }).catch(err => {
        console.log(err.message);
      });
    };

    factory.addScreening = function (screening, childId, callBack, errCallback) {
      getScreeningInfo({ screening: screening.id, child: childId })
        .then(calculateStatus)
        .then(updateChildRecord)
        .then(callBack)
        .catch(function(err) {
          console.log(err);
        });
    };

    function fixScreenings(allChildren) {
      return Promise.all(allChildren.docs.map(function(child) {
        return getScreeningInfo({ screening: child.lastScreening, child: child._id })
          .then(calculateStatus)
          .then(updateChildRecord);
      })).then(function(fixedList) {
        return database.find({ selector: { lastScreening: { $gt: null } } });
      });
    }
    factory.updateScreenings = function (allChildren) {
      fixScreenings(allChildren);
    };

    factory.insert = function (childInfo, callback, errorCallback) {
      if (childInfo._id.length <= 5) {
        childInfo._id = childInfo._id + currentDbName + '_' + moment.now();
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
    };

    factory.updateChild = function (childInfo) {
      // childInfo._id = uuid4.generate ();
      database.put(childInfo)
        .then(function (response) {
          // Do something with the response
          return response;
        })
        .catch(function (error) {
          // Do something with the error
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
        })
        .on('denied', function (err) {
          console.log('failure to replicate on sync up');
        // a document failed to replicate (e.g. due to permissions)
        })
        .on('complete', function (response) {
          console.log('sync up complete');
          callback(response);
        })
        .on('error', function (err) {
          errorCallback(err);
        });
    };

    factory.newSyncFrom = function(upStreamDb, callback, errorCallback) {
      database.replicate.from(upStreamDb, { filter: 'filter_ddocs/ddocs' })
        .on('change', function (info) {
          console.log('change sync up');
          Notification.success({ message: `<i class="glyphicon glyphicon-ok"></i> change sync up`, delay: 550 });
        }).on('paused', function (err) {
          console.log('sync down paused');
          Notification.success({ message: `<i class="glyphicon glyphicon-ok"></i> sync down paused`, delay: 550 });
        // replication paused (e.g. replication up to date, user went offline)
        }).on('active', function () {
        // replicate resumed (e.g. new changes replicating, user went back online)
        })
        .on('denied', function (err) {
          console.log('failure to replicate on sync down');
          Notification.error({ message: `<i class="glyphicon glyphicon-ok"></i> ${ err.message } failure to replicate on sync down`, delay: 550 });
        // a document failed to replicate (e.g. due to permissions)
        })
        .on('complete', function (response) {
          console.log('sync down complete');
          Notification.success({ message: `<i class="glyphicon glyphicon-ok"></i> sync down complete`, delay: 550 });
          callback(response);
        })
        .on('error', function (err) {
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
