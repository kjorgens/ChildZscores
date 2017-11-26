"use strict";

var request = require('request');
var Promise = require('bluebird');

getdatabaseList()
    .then(updateChildRecords).all()
    // .then(findScreeningings).all()
    .then(outOfHere).catch(function(err) {
      console.log("error" + err);
});

function getdatabaseList() {
  return new Promise(function(resolve, reject) {
    var stakeList = [];

    var countryList = require('nano')('https://' + process.env.COUCH_URL + 'country_list');
    if (process.env.STAKE_TO_UPDATE) {
      stakeList.push (process.env.STAKE_TO_UPDATE);
      resolve(stakeList);
    } else {
      countryList.get ('liahona_kids_countries_stakes', function (err, body) {
        if (err) {
          reject ('could not get db list');
        } else {
          var countryFound = false;
          if (process.env.COUNTRY) {
            for (i = 0; i < body.countries.length && !countryFound; i++) {
              country = body.countries[i];
              if (~process.env.COUNTRY.toUpperCase ().indexOf (country.name.toUpperCase ())) {
                country.stakes.forEach (function (stake) {
                  stakeList.push (stake.stakeDB);
                  countryFound = true;
                })
              }
            }
            if (countryFound) {
              resolve (stakeList);
            } else {
              var emptyError = new Error ();
              emptyError.name = 'Database not found';
              emptyError.message = process.env.COUNTRY + ' database not found';
              reject (emptyError);
            }
          } else {
            body.countries.forEach (function (country) {
              country.stakes.forEach (function (stake) {
                stakeList.push (stake.stakeDB);
              })
            });
            resolve (stakeList);
          }
        }
      })
    }
  })
}

function updateChildObject(stakeDb, childInfo) {
  return new Promise(function (resolve,reject){
    if(childInfo === undefined){
      resolve('update not needed');
    } else {
      stakeDb.insert (childInfo, function (err, childResponse) {
        if (err) {
          console.log('error updating ' + childInfo.firstName + ' ' + childInfo.lastName);
          console.log(err.message);
          resolve (err.message);
//      reject(err);
        } else {
          if (childResponse.ok) {
            console.log(childInfo.firstName + ' ' + childInfo.lastName + '  child update complete');
            resolve ('child update complete');
          } else {
            console.log (err.message);
            console.log(childInfo.firstName + ' ' + childInfo.lastName);
            console.log(err.message);
            resolve (err.message);
          }
        }
      })
    }
  });
}

function updateChildRecords(stakeDBList){
  return Promise.each(stakeDBList, getChildRecords);
}

function getChildRecords(stakeDB){
 // return new Promise(function(resolve,reject){
    dbName = process.env.STAKE_TO_UPDATE || stakeDB;
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + dbName);
    stakeDb.view('children_list', 'screen', function(error, response, body) {
      if (!error && response) {
        // if (response.rows.length === 0) {
        //   resolve();
        //   // var emptyError = new Error();
        //   // emptyError.name = 'No Children Found';
        //   // emptyError.message = 'No Children found in ' + stakeDB;
        //   // reject(emptyError);
        // }
        // if(response.rows === 0){
        //   resolve();
        //   // var emptyError = new Error();
        //   // emptyError.name = 'Empty database';
        //   // emptyError.message = 'No screenings in ' + stakeDB;
        //   // reject(emptyError);
        // }
        childList = [];
        response.rows.forEach(function(child) {
          childList.push({db:stakeDb, child: child.key});
        });
        return Promise.each(childList, findScreeningings);
      } else {
        var myError = new Error();
        myError.name = error.message;
        myError.message = error.message;
        console.log("error at line 117");
      }
    })
//  })
}

function calculateStatus(screeningObj) {
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
  return({ screeningObj: screeningObj, zscoreStatus: zscoreStatus });
}

function sortByDate(listIn) {
    listIn.sort(function(x, y) {
      if (x.doc.surveyDate > y.doc.surveyDate) {
        return -1;
      }
      if (x.doc.surveyDate < y.doc.surveyDate) {
        return 1;
      }
      if (x.doc.surveyDate === y.doc.surveyDate) {
        return 0;
      }
      return 0;
    });
    return(listIn);
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

function outOfHere(input){
  console.log("done");
}

function findScreeningings(input) {
  return new Promise(function(resolve, reject) {
    input.db.view('scr_owner_search', 'find_by_owner', {
      key: input.child._id,
      include_docs: true
    }, function (error, response) {
      if (!error) {
        if (response.rows.length === 0) {
          resolve(updateChildObject(input.db, undefined));
        } else {
          var sList = sortByDate(response.rows);
          input.child.lastScreening = sList[0].doc._id;
          statusInfo = calculateStatus(sList[0].doc);
          input.child.zscoreStatus = statusInfo.zscoreStatus;
          input.child.statusColor = statusColor(statusInfo.zscoreStatus);
          resolve(updateChildObject(input.db, input.child));
        }
      } else {
        var msg = '';
        var myError = new Error({name: '', errors: [], message: ''});
        myError.name = 'database error';
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject(myError);
        } else {
          var reasons = JSON.parse(response.body);
          myError.message = msg;
          reject(myError);
        }
      }
    });
  });
}
