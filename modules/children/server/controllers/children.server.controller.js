'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    request = require('request'),
    fs = require('fs'),
    csvParse = require('babyparse'),
    moment = require('moment'),
    uuid = require('uuid4'),
    csvloader = require('multer'),
    config = require(path.resolve('./config/config')),
    Promise = require('bluebird'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var errorStack = [];

var filterList = [
  {
    "_id": "_design/filter_ddocs",
    "filters": {
      "ddocs": "function(doc, req) {if(doc._id[0] != '_') {return true} else {return false}  }"
    }
  },
];

var viewList = [
  {
    "_id": "_design/children_list",
    "views": {
      "screen": {
        "map": "function(doc){if(doc.firstName){emit(doc)}}"
      }
    }
  },
  {
    "_id": "_design/name_search",
    "views": {
      "find_by_name": {
        "map": "function(doc){emit([doc.firstName, doc.lastName], doc)}"
      }
    }
  },
  {
    "_id": "_design/scr_list",
    "views": {
      "screen": {
        "map": "function(doc){if(doc.owner){emit(doc)}}"
      }
    }
  },
  {
    "_id": "_design/screen_search",
    "views": {
      "find_by_owner": {
        "map": "function(doc){emit([doc.owner, doc.surveyDate], doc)}"
      }
    }
  },
  {
    "_id": "_design/zscore_kids",
    "views": {
      "screen": {
        "map": "function(doc){if(doc.zScore.ha < -2 || doc.zScore.wa < -2 || doc.zScore.wl < -2){emit(doc)}}"
      }
    }
  }
];

function validateView(type, stakeDB, view) {
  return new Promise(function(resolve,reject) {
    var stakeDb = require ('nano') ('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + stakeDB);
    var viewObject;
    if(~type.indexOf('view')){
      viewObject = {_id: view._id, views: view.views};
    }
    if(~type.indexOf('filter')){
      viewObject = {_id: view._id, filters: view.filters};
    }
    stakeDb.get(view._id, function(err, body) {
      if (err) {
        stakeDb.insert(viewObject, function(err, response) {
          if (err) {
            var msg = '';
            var updateError = new Error(err.message);
            console.log(err.message);
            reject(updateError);
          } else {
            console.log('view ' + view._id + ' created in ' + stakeDB);
            resolve('view ' + view._id + ' created in ' + stakeDB);
          }
        });
      } else {
        console.log('view exists or error');
        resolve(view._id + ' already exists');
      }
    })
  })
}

exports.checkUpdateViews = function (req, res) {
  var toCheck = [];
  viewList.forEach (function (view) {
    toCheck.push (validateView ('view', req.params.stakeDB, view));
  });
  filterList.forEach (function (filter) {
    toCheck.push (validateView ('filter', req.params.stakeDB, filter));
  });

  var allViews = Promise.all(toCheck);
  allViews.then(function(input){
    return (res.status (200).send ({message: input}));
  }).catch (function (err) {
    return res.status (400).send ({
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  });
};
function getOwnerData(parmObj) {
  return new Promise(function(resolve, reject) {
    var couchURL;
    if (process.env.COUCH_URL.indexOf('localhost') > -1) {
      couchURL = 'http://' + process.env.COUCH_URL + '/';
    } else {
      couchURL = 'https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/';
    }
    var screenData = parmObj.screenInfo.key;
    var sortField = parmObj.sort;
    request.get(couchURL + parmObj.stakeDB + '/' +
        parmObj.screenInfo.key.owner, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var ownerInfo = JSON.parse(body);
        parmObj.ownerInfo = ownerInfo;
        parmObj.screenInfo = screenData;
        resolve(addLineToStack(ownerInfo, screenData, sortField, parmObj.stakeDB));
      } else {
        var msg = '';
        var myError = new Error();
        myError.name = screenData._id;
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject(myError);
        } else {
  //        var reasons = JSON.parse(response.body);
  //        var msg = 'Database Error: ' + response.statusCode + ': ' + response.statusMessage + '  Error:' + reasons.error + ' Reason: ' + reasons.reason;
  //        myError.message = msg;
          reject(myError);
        }
      }
    });
  });
}
function pullSaveScreenData(parmObj) {
  return new Promise(function(resolve, reject) {
    var couchURL;
    var ddoc = parmObj.filter.indexOf('all') > -1 ? 'scr_list' : 'zscore_kids';
    if (process.env.COUCH_URL.indexOf('localhost') > -1) {
      couchURL = 'http://' + process.env.COUCH_URL + '/';
    } else {
      couchURL = 'https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/';
    }
    request.get(couchURL + parmObj.stakeDB +
        '/_design/' + ddoc + '/_view/screen', function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj = JSON.parse(body);
        if (jsonObj.total_rows === 0) {
          var emptyError = new Error();
          emptyError.name = 'Empty database';
          emptyError.message = 'No entries in ' + parmObj.stakeDB + ', Sync first?';
          reject(emptyError);
        }
        var screenList = [];
        jsonObj.rows.forEach(function(screening) {
          parmObj.screenInfo = screening;
          screenList.push(getOwnerData(parmObj));
        });
        resolve(screenList);
      } else {
        var msg = '';
        var myError = new Error({name:'',errors:[],message:''});
        myError.name = 'database error';
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject(myError);
        } else {
          var reasons = JSON.parse(response.body);
          //        myError.push('Database Error: ' + response.statusCode + ': ' + response.statusMessage + '  Error:' + reasons.error + ' Reason: ' + reasons.reason);
          myError.message = msg;
          reject(myError);
        }
      }
    });
  });
}

function getLastScreeningData(ownerInfo, stakeDB, sortField) {
  return new Promise(function(resolve, reject) {
    var couchURL;
    if (process.env.COUCH_URL.indexOf('localhost') > -1) {
      couchURL = 'http://' + process.env.COUCH_URL + '/';
    } else {
      couchURL = 'https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/';
    }
    request.get(couchURL + stakeDB + '/' +
        ownerInfo.lastScreening, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          var screeningInfo = JSON.parse(body);
        } catch(e){
          console.log('parse problem');
        }

        // screenInfo = screeningInfo;
        if(ownerInfo === undefined || screeningInfo === undefined){
          console.log('what happened');
        }
        resolve(addLineToStack( ownerInfo, screeningInfo, sortField, stakeDB));
      } else if (!error) {
        resolve();
      } else  {
        var msg = '';
        var myError = new Error();
        myError.name = screenData._id;
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject(myError);
        } else {
          var reasons = JSON.parse(response.body);
          var msg = 'Database Error: ' + response.statusCode + ': ' + response.statusMessage + '  Error:' + reasons.error + ' Reason: ' + reasons.reason;
          myError.message = msg;
          reject(myError);
        }
      }
    });
  });
}

function buildOutputFromLastScreening(parmObj) {
  return new Promise(function(resolve, reject) {
    var couchURL;
    var ddoc = parmObj.filter.indexOf('all') > -1 ? 'children_list' : 'zscore_kids';
    if (process.env.COUCH_URL.indexOf('localhost') > -1) {
      couchURL = 'http://' + process.env.COUCH_URL + '/';
    } else {
      couchURL = 'https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/';
    }
    request.get(couchURL + parmObj.stakeDB +
        '/_design/' + ddoc + '/_view/screen', function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj = JSON.parse(body);
        if (jsonObj.total_rows === 0) {
          var emptyError = new Error();
          emptyError.name = 'Empty database';
          emptyError.message = 'No entries in ' + parmObj.stakeDB + ', Sync first?';
          reject(emptyError);
        }
        var childrenList = [];
        jsonObj.rows.forEach(function(child) {
          if (child.key.lastScreening && (Object.getOwnPropertyNames(child.key.lastScreening).length > 0) && child.key) {
            childrenList.push (getLastScreeningData (child.key, parmObj.stakeDB, parmObj.sortField));
          }
          else {
            console.log('problem here');
          }
        });
        if(childrenList.length === 0){
          var msg = '';
          var myError = new Error({name:'',errors:[],message:''});
          myError.message = 'No Screenings entered.';
          myError.name = 'Children in database ' + parmObj.stakeDB + ' contain no screenings ';
          reject(myError);
        } else {
          resolve (childrenList);
        }
      } else {
        var msg = '';
        var myError = new Error({name:'',errors:[],message:''});
        myError.name = 'database error';
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject(myError);
        } else {
          var reasons = JSON.parse(response.body);
          //        myError.push('Database Error: ' + response.statusCode + ': ' + response.statusMessage + '  Error:' + reasons.error + ' Reason: ' + reasons.reason);
          myError.message = msg;
          reject(myError);
        }
      }
    });
  });
}

function writeTheFile(input) {
  return new Promise(function(resolve, reject) {
    var headerLine = 'id,gender,firstName,lastName,birthdate,idGroup,mother,father,phone,address,city,ward,lds,screenDate,weight,height,age,ha,wa,wh,status\n';
    var outPut = headerLine += input.data;
    fs.writeFile('files/' + input.dbId + '.csv', outPut, function (err) {
      if (err) {
        console.log(err);
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
}

function collectEm(sortedList) {
  return new Promise(function(resolve, reject) {
    var writeStack = '';
    var count = 0;
    sortedList.forEach(function(line) {
      count++;
      if(line === undefined){
        console.log('problem!');
      } else {
        writeStack += line.dataLine;
      }
    });
    resolve({ data: writeStack, dbId: sortedList[0].stakeDB });
  });
}

function addLineToStack(ownerInfo, screenInfo, sortField, stakeDB) {
  return new Promise(function (resolve, reject) {
    if (ownerInfo.address !== undefined && ownerInfo.address.indexOf(',') > -1) {
      ownerInfo.address = ownerInfo.address.replace(/,/g, ' ');
    }
    if (ownerInfo.mother !== undefined && ownerInfo.mother.indexOf(',') > -1) {
      ownerInfo.mother = ownerInfo.mother.replace(/,/g, ' ');
    }
    if (ownerInfo.father !== undefined && ownerInfo.father.indexOf(',') > -1) {
      ownerInfo.father = ownerInfo.father.replace(/,/g, ' ');
    }
    if (ownerInfo.city !== undefined && ownerInfo.city.indexOf(',') > -1) {
      ownerInfo.city = ownerInfo.city.replace(/,/g, ' ');
    }
    if (ownerInfo.ward !== undefined && ownerInfo.ward.indexOf(',') > -1) {
      ownerInfo.ward = ownerInfo.ward.replace(/,/g, ' ');
    }
    if (ownerInfo.firstName !== undefined && ownerInfo.firstName.indexOf(',') > -1) {
      ownerInfo.firstName = ownerInfo.firstName.replace(/,/g, ' ');
    }
    if (ownerInfo.lastName !== undefined && ownerInfo.lastName.indexOf(',') > -1) {
      ownerInfo.lastName = ownerInfo.lastName.replace(/,/g, ' ');
    }
    var dataObj = {
      childId: ownerInfo._id,
      gender: screenInfo.gender[0].toUpperCase() + screenInfo.gender.substr(1),
      firstName: ownerInfo.firstName,
      lastName: ownerInfo.lastName,
      birthDate: ownerInfo.birthDate,
      idGroup: ownerInfo.idGroup || '',
      mother: ownerInfo.mother || '',
      father: ownerInfo.father || '',
      city: ownerInfo.city || '',
      phone: ownerInfo.phone || '',
      address: ownerInfo.address || '',
      ward: ownerInfo.ward || '',
      memberStatus: ownerInfo.memberStatus || '',
      lastScreening: ownerInfo.lastScreening,
      weight: screenInfo.weight,
      height: screenInfo.height,
      age: screenInfo.monthAge,
      ha: screenInfo.zScore.ha,
      wa: screenInfo.zScore.wa,
      wl: screenInfo.zScore.wl,
      surveyDate: screenInfo.surveyDate,
      screenId: screenInfo._id
    };
    var zscoreStatus = '';
    if (screenInfo.zScore.wl < -2) {
      zscoreStatus = 'Acute: supplements required';
    } else if ((screenInfo.zScore.ha < -2 || screenInfo.zScore.wa < -2) && dataObj.age > 6 && dataObj.age < 36) {
      zscoreStatus = 'Acute: supplements required';
    } else if ((screenInfo.zScore.ha < -2 || screenInfo.zScore.wa < -2) && dataObj.age > 36 && dataObj.age < 48) {
      zscoreStatus = 'Micro nutrients required';
    } else if (screenInfo.zScore.ha < -1 ||
        screenInfo.zScore.wa < -1 ||
        screenInfo.zScore.wl < -1) {
      zscoreStatus = 'At Risk: Come to next screening';
    } else {
      zscoreStatus = 'Normal';
    }

    var dataLine = dataObj.childId + ',' + dataObj.gender + ',' + dataObj.firstName + ',' + dataObj.lastName + ',' + dataObj.birthDate +
        ',' + dataObj.idGroup + ',' + dataObj.mother + ',' + dataObj.father + ',' + dataObj.phone + ',' + dataObj.address +
        ',' + dataObj.city + ',' + dataObj.ward + ',' + dataObj.memberStatus + ',' + dataObj.surveyDate + ',' + dataObj.weight + ',' + dataObj.height +
        ',' + dataObj.age + ',' + dataObj.ha + ',' + dataObj.wa + ',' + dataObj.wl + ',' + zscoreStatus + '\n';
    resolve({ data: dataObj, dataLine: dataLine, stakeDB: stakeDB, sortField: sortField });
  });
}

function sortEm(listIn) {
  return new Promise(function(resolve, reject) {
    listIn.sort(function(x, y) {
      if (x.data[x.sortField] < y.data[x.sortField]) {
        return -1;
      }
      if (x.data[x.sortField] > y.data[x.sortField]) {
        return 1;
      }
      if (x.data[x.sortField] === y.data[x.sortField]) {
        return 0;
      }
      return 0;
    });
    resolve(listIn);
  });
}

exports.createCSVFromDB = function (req, res) {
  function reportCSVComplete(input) {
    return res.status(200).send({
      message: 'files/' + req.params.stakeDB + '.csv'
    });
  }
  var parmObj = { stakeDB: req.params.stakeDB, filter: req.params.filter, sortField: req.params.sortField, screenInfo: {} };
 //buildOutputFromLastScreening(parmObj) // child + latest screening
   pullSaveScreenData(parmObj) //child + all screenings
      .all().then(sortEm)
      .then(collectEm)
      .then(writeTheFile)
      .then(reportCSVComplete).catch(function(err) {
    return res.status(400).send({
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  });
};

exports.getSyncURL = function(req, res) {
  return res.json({ entity: process.env.SYNC_ENTITY, url: process.env.COUCH_URL });
};

exports.getCountryList = function(req, res) {
  request.get('https://' + process.env.COUCH_URL +
      '/country_list/liahona_kids_countries_stakes', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonObj = JSON.parse(body);
      res.json(jsonObj);
    } else {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(error)
      });
    }
  });
};

function parseCsv(input, cb) {
  fs.rename(input, input + '.csv', function(err) {
    if (err) {
      console.log(err);
    } else {
      cb(csvParse.parseFiles(input + '.csv', { delimiter: ',', dynamicTyping: true }));
    }
  });
}

function gradeZScores(screenObj) {
  screenObj.zScore.haStatus = 'normalZscore';
  screenObj.zScore.waStatus = 'normalZscore';
  screenObj.zScore.wlStatus = 'normalZscore';
  if (screenObj.zScore.ha < -2) {
    screenObj.zScore.haStatus = 'redZoneZscore';
  } else {
    if (screenObj.zScore.ha < -1 && screenObj.zScore.ha > -2) {
      screenObj.zScore.haStatus = 'marginalZscore';
    }
  }
  if (screenObj.zScore.wa < -2) {
    screenObj.zScore.waStatus = 'redZoneZscore';
  } else {
    if (screenObj.zScore.wa < -1 && screenObj.zScore.wa > -2) {
      screenObj.zScore.waStatus = 'marginalZscore';
    }
  }
  if (screenObj.zScore.wl < -3) {
    screenObj.zScore.wlStatus = 'dangerZscore';
  } else {
    if (screenObj.zScore.wl < -2 && screenObj.zScore.wl > -3) {
      screenObj.zScore.wlStatus = 'redZoneZscore';
    } else {
      if (screenObj.zScore.wl < -1 && screenObj.zScore.wl > -2) {
        screenObj.zScore.wlStatus = 'marginalZscore';
      }
    }
  }
  return(screenObj);
}

function saveScreening(dataBase, childInfo, screeningInfo) {
  return new Promise(function(resolve,reject){
    var statusInfo = calculateStatus(screeningInfo);
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    // screeningInfo._id = 'scr_' + childInfo.firstName.replace(' ','_') + '_' + dataBase + '_' + moment();
    screeningInfo._id = 'scr_' + '_' + dataBase + '_' + uuid();
    screeningInfo.owner = childInfo._id;
    stakeDb.insert(screeningInfo, function (err, scrResponse) {
      if (err) {
        console.log (err.message);
        errorStack.push (screeningInfo.owner);
        errorStack.push (err.message);
        resolve (err.message);
//            reject(err);
      } else {
        childInfo.lastScreening = scrResponse.id;
//        childInfo._rev = childInfo._rev;
        childInfo.zscoreStatus = statusInfo.zscoreStatus;
        childInfo.statusColor = statusColor (statusInfo.zscoreStatus);
        resolve (updateChildObject (dataBase, childInfo));
      }
    })
  })
}

function updateChildObject(dataBase, childInfo) {
  return new Promise(function (resolve,reject){
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    stakeDb.insert (childInfo, function (err, childResponse) {
      if (err) {
        console.log (err.message);
        errorStack.push ('updating ' + childInfo.firstName + ' ' + childInfo.lastName);
        errorStack.push (err.message);
        resolve (err.message);
//      reject(err);
      } else {
        if (childResponse.ok) {
          resolve('update complete');
        } else {
          console.log (err.message);
          errorStack.push (childInfo.firstName + ' ' + childInfo.lastName);
          errorStack.push (err.message);
          resolve (err.message);
        }
      }
    })
  });
}

function saveTheObjects(dataBase, childInfo, screeningInfo) {
  return new Promise(function (resolve,reject){
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    //   childInfo._id = 'chld_' + childInfo.firstName.replace(' ','_') + '_' + dataBase + '_' + moment ();
    childInfo._id = 'chld_' + dataBase + '_' + uuid();
    stakeDb.insert (childInfo, function (err, childResponse) {
      if (err) {
        console.log (err.message);
        errorStack.push (childInfo.firstName + ' ' + childInfo.lastName);
        errorStack.push (err.message);
        resolve (err.message);
//      reject(err);
      } else {
        if (childResponse.ok) {
          var childObj = {};
          childObj = childInfo;
          childObj._rev = childResponse.rev;
          // existingChildren.push (childObj);
          resolve(isScreeningDuplicate(dataBase, childObj, screeningInfo));
        } else {
          console.log (err.message);
          errorStack.push (childInfo.firstName + ' ' + childInfo.lastName);
          errorStack.push (err.message);
          resolve (err.message);
        }
      }
    })
  })
}

function calculateStatus(screeningObj) {
  var zscoreStatus = '';
  if (screeningObj.zScore.wl < -2) {
    zscoreStatus = 'Acute: supplements required';
  } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.age > 6 && screeningObj.age < 36) {
    zscoreStatus = 'Acute: supplements required';
  } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.age > 36 && screeningObj.age < 48) {
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

function childInDatabase(dataBase, childInfo, screeningInfo) {
  return new Promise (function (resolve, reject) {

    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    stakeDb.view('name_search', 'find_by_name', { key: [ childInfo.firstName, childInfo.lastName], include_docs: true}, function(error, response) {
      if (!error) {
        if (response.rows.length === 0) {
          resolve (saveTheObjects(dataBase, childInfo, screeningInfo));
        } else {
          childInfo = response.rows[0].doc;
          resolve (isScreeningDuplicate(dataBase, childInfo, screeningInfo));
        }
      } else {
        var msg = '';
        var myError = new Error ({name: '', errors: [], message: ''});
        myError.name = 'database error';
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject (myError);
        } else {
          var reasons = JSON.parse (response.body);
          myError.message = msg;
          reject (myError);
        }
      }
    });
  });
}

function isScreeningDuplicate(dataBase, childInfo, screeningInfo) {
  return new Promise (function (resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    stakeDb.view('screen_search', 'find_by_owner', { key: [ childInfo._id, screeningInfo.surveyDate], include_docs: true}, function(error, response) {
      if (!error) {
        if (response.rows.length === 0) {
          resolve (saveScreening(dataBase, childInfo, screeningInfo));
        } else {
          childInfo = response.rows[0].doc;
          resolve ('duplicate screening, not added');
        }
      } else {
        var msg = '';
        var myError = new Error ({name: '', errors: [], message: ''});
        myError.name = 'database error';
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject (myError);
        } else {
          var reasons = JSON.parse (response.body);
          myError.message = msg;
          reject (myError);
        }
      }
    });
  });
}

function buildObject(dataBase, input) {
  return new Promise(function(resolve, reject) {
    var i = 0;
    var k = 0;
    var columnData = input.data;
    var colIndexes = Object.keys(columnData[0]);
    var firstNameIndex = 0;
    var lastNameIndex = 0;
    var birthDateIndex = 0;
    var motherIndex = 0;
    var fatherIndex = 0;
    var addressIndex = 0;
    var idGroupIndex = 0;
    var cityIndex = 0;
    var wardIndex = 0;
    var phoneIndex = 0;
    var monthAgeIndex = 0;
    var genderIndex = 0;
    var weightIndex = 0;
    var heightIndex = 0;
    var haIndex = 0;
    var waIndex = 0;
    var whIndex = 0;
    var ldsIndex = 0;
    var surveyDateIndex = 0;
    var statusIndex = 0;

    for (i = 1; i < columnData[0].length; i++) {
      if (~columnData[0][i].toLowerCase().indexOf('firstname')) {
        firstNameIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('lastname')) {
        lastNameIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('mother')) {
        motherIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('father')) {
        fatherIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('birthdate')) {
        birthDateIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('address')) {
        addressIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('city')) {
        cityIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('ward')) {
        wardIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('phone')) {
        phoneIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('age')) {
        monthAgeIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('gender')) {
        genderIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('weight')) {
        weightIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('height')) {
        heightIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('ha')) {
        haIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('wa')) {
        waIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('wh')) {
        whIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('lds')) {
        ldsIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('screendate')) {
        surveyDateIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('idgroup')) {
        idGroupIndex = i;
      } else if (~columnData[0][i].toLowerCase().indexOf('status')) {
        statusIndex = i;
      }else {
        console.log(columnData[0][i]);
      }
    }

    var dataBaseObj = [];
    var j;
    for (j = 1; j < columnData.length-1; j++) {
      var childObj = {};
      var screenObj = {zScore: { ha:'',haStatus:'', wa:'',waStatus:'', wl:'', wlStatus:''}};
      childObj.birthDate = columnData[j][birthDateIndex];
      childObj.firstName = columnData[j][firstNameIndex];
      childObj.lastName = columnData[j][lastNameIndex];
      childObj.mother = motherIndex !== 0 ? columnData[j][motherIndex] : undefined;
      childObj.father = fatherIndex !== 0 ? columnData[j][fatherIndex] : undefined;
      childObj.address = addressIndex !== 0 ? columnData[j][addressIndex] : undefined;
      childObj.city = cityIndex !== 0 ? columnData[j][cityIndex] : undefined;
      childObj.ward = wardIndex !== 0 ? columnData[j][wardIndex] : undefined;
      childObj.phone = phoneIndex !== 0 ? columnData[j][phoneIndex] : undefined;
      childObj.monthAge = columnData[j][monthAgeIndex];
      childObj.gender = columnData[j][genderIndex];
      childObj.lds = columnData[j][ldsIndex];
      childObj.idGroup = columnData[j][idGroupIndex];

      screenObj.surveyDate = columnData[j][surveyDateIndex];
      screenObj.monthAge = columnData[j][monthAgeIndex];
      screenObj.gender = columnData[j][genderIndex];
      screenObj.weight = columnData[j][weightIndex];
      screenObj.height = columnData[j][heightIndex];
      screenObj.zScore.ha = columnData[j][haIndex];
      screenObj.zScore.wa = columnData[j][waIndex];
      screenObj.zScore.wl = columnData[j][whIndex];
      dataBaseObj.push (childInDatabase(dataBase, childObj, gradeZScores(screenObj)));
    }
    resolve(dataBaseObj).each();
  });
}

exports.uploadCsv = function (req, res) {
  function returnOk() {
    if(errorStack.length > 0){
      return (res.status (400).send ({message: errorStack.join()}));
    }
    return (res.status (200).send ({message: 'update complete'}));
  }

  var upload = csvloader (config.uploads.csvUpload).single ('newUploadCsv');
  var csvUploadFileFilter = require (path.resolve ('./config/lib/csvloader.js')).csvUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = csvUploadFileFilter;

  upload (req, res, function (uploadError) {
    if (uploadError) {
      return res.status (400).send ({
        message: 'Error occurred while uploading csv file'
      });
    } else {
      // parse csv
      parseCsv (res.req.file.path, function (parsedData) {
        buildObject(req.params.stakeDB, parsedData)
            .all ().then (returnOk).catch (function (err) {
          return res.status (400).send ({
            message: err.message,
            name: err.name,
            stack: err.stack
          });
        });
      })
    }
  })
};

exports.listDbs = function(req, res) {
  request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
      '/_all_dbs', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonObj = JSON.parse(body);
      res.json(jsonObj);
    } else {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(error)
      });
    }
  });
};

function downloadFile(input) {
  var options = {
    root: __dirname + '/files/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  input[0].res.sendFile(input[0].req.params.stakeDB + '.csv', options, function(err) {
    if (err) {
      console.log(err);
      input[0].res.status(err.status).end();
    } else {
      console.log('Sent:', input[0].req.params.stakeDB + '.csv');
    }
  });
}
