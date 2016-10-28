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
  csvloader = require('multer'),
  config = require(path.resolve('./config/config')),
  Promise = require('bluebird'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
  var errorStack = [];

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
        resolve(addLineToStack(parmObj));
      } else {
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
    sortedList.forEach(function(line) {
      writeStack += line.dataLine;
    });
    resolve({ data: writeStack, dbId: sortedList[0].stakeDB });
  });
}

function addLineToStack(parmObj) {
  return new Promise(function (resolve, reject) {
    var cleanAddr;
    if (parmObj.ownerInfo.address !== undefined && parmObj.ownerInfo.address.indexOf(',') > -1) {
      parmObj.ownerInfo.address = parmObj.ownerInfo.address.replace(/,/g, ' ');
    }
    if (parmObj.ownerInfo.mother !== undefined && parmObj.ownerInfo.mother.indexOf(',') > -1) {
      parmObj.ownerInfo.mother = parmObj.ownerInfo.mother.replace(/,/g, ' ');
    }
    if (parmObj.ownerInfo.father !== undefined && parmObj.ownerInfo.father.indexOf(',') > -1) {
      parmObj.ownerInfo.father = parmObj.ownerInfo.father.replace(/,/g, ' ');
    }
    if (parmObj.ownerInfo.city !== undefined && parmObj.ownerInfo.city.indexOf(',') > -1) {
      parmObj.ownerInfo.city = parmObj.ownerInfo.city.replace(/,/g, ' ');
    }
    if (parmObj.ownerInfo.ward !== undefined && parmObj.ownerInfo.ward.indexOf(',') > -1) {
      parmObj.ownerInfo.ward = parmObj.ownerInfo.ward.replace(/,/g, ' ');
    }
    if (parmObj.ownerInfo.firstName !== undefined && parmObj.ownerInfo.firstName.indexOf(',') > -1) {
      parmObj.ownerInfo.firstName = parmObj.ownerInfo.firstName.replace(/,/g, ' ');
    }
    if (parmObj.ownerInfo.lastName !== undefined && parmObj.ownerInfo.lastName.indexOf(',') > -1) {
      parmObj.ownerInfo.lastName = parmObj.ownerInfo.lastName.replace(/,/g, ' ');
    }
    var dataObj = {
      childId: parmObj.ownerInfo._id,
      gender: parmObj.screenInfo.gender,
      firstName: parmObj.ownerInfo.firstName,
      lastName: parmObj.ownerInfo.lastName,
      birthDate: parmObj.ownerInfo.birthDate,
      idGroup: parmObj.ownerInfo.idGroup || '',
      mother: parmObj.ownerInfo.mother || '',
      father: parmObj.ownerInfo.father || '',
      city: parmObj.ownerInfo.city || '',
      phone: parmObj.ownerInfo.phone || '',
      address: parmObj.ownerInfo.address || '',
      ward: parmObj.ownerInfo.ward || '',
      memberStatus: parmObj.ownerInfo.memberStatus || '',
      lastScreening: parmObj.ownerInfo.lastScreening,
      weight: parmObj.screenInfo.weight,
      height: parmObj.screenInfo.height,
      age: parmObj.screenInfo.monthAge,
      ha: parmObj.screenInfo.zScore.ha,
      wa: parmObj.screenInfo.zScore.wa,
      wl: parmObj.screenInfo.zScore.wl,
      surveyDate: parmObj.screenInfo.surveyDate,
      screenId: parmObj.screenInfo._id
    };
    var zscoreStatus = '';
    if (parmObj.screenInfo.zScore.wl < -2) {
      zscoreStatus = 'Acute: supplements required';
    } else if ((parmObj.screenInfo.zScore.ha < -2 || parmObj.screenInfo.zScore.wa < -2) && dataObj.age > 6 && dataObj.age < 36) {
      zscoreStatus = 'Acute: supplements required';
    } else if ((parmObj.screenInfo.zScore.ha < -2 || parmObj.screenInfo.zScore.wa < -2) && dataObj.age > 36 && dataObj.age < 48) {
      zscoreStatus = 'Micro nutrients required';
    } else if (parmObj.screenInfo.zScore.ha < -1 ||
         parmObj.screenInfo.zScore.wa < -1 ||
         parmObj.screenInfo.zScore.wl < -1) {
      zscoreStatus = 'At Risk: Come to next screening';
    } else {
      zscoreStatus = 'Normal';
    }
    var dataLine = dataObj.childId + ',' + dataObj.gender + ',' + dataObj.firstName + ',' + dataObj.lastName + ',' + dataObj.birthDate +
        ',' + dataObj.idGroup + ',' + dataObj.mother + ',' + dataObj.father + ',' + dataObj.phone + ',' + dataObj.address +
        ',' + dataObj.city + ',' + dataObj.ward + ',' + dataObj.memberStatus + ',' + dataObj.surveyDate + ',' + dataObj.weight + ',' + dataObj.height +
        ',' + dataObj.age + ',' + dataObj.ha + ',' + dataObj.wa + ',' + dataObj.wl + ',' + zscoreStatus + '\n';
    resolve({ data: dataObj, dataLine: dataLine, stakeDB: parmObj.stakeDB, sortField: parmObj.sortField });
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
    res.status(200).send({
      message: 'files/' + req.params.stakeDB + '.csv'
    });
  }
  var parmObj = { stakeDB: req.params.stakeDB, filter: req.params.filter, sortField: req.params.sortField, screenInfo: {} };
  pullSaveScreenData(parmObj)
  .all().then(sortEm)
  .then(collectEm)
  .then(writeTheFile).catch(function(err) {
    return res.status(400).send({
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  }).then(reportCSVComplete);
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

function infoToCouch (dataBase, record) {
  return new Promise(function(resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + dataBase);
    stakeDb.insert({ _id: 'scr_' + dataBase + '_' + moment.now() }, function(err, response) {
      if (err) {
        console.log(err.message);
        reject(err.message);
      } else {
        stakeDb.insert({ _id: 'chld_' }, function(err, response) {
          if (err) {
            console.log(err.message);
            reject(err.message);
          } else {
            console.log('child record saved');
          }
        });
        console.log('screening added to ' + dataBase);
        resolve('created');
      }
    });
  });
}

// function locateOwner(data) {
//   return new Promise(function(resolve, reject) {
//     var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + dataBase);
//   });
// }

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

function saveTheObjects(dataBase, childInfo, screeningInfo) {
  return new Promise(function (resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    childInfo._id = 'chld_' + childInfo.firstName + '_' + childInfo.lastName + '_' + dataBase + '_' + moment();
    stakeDb.insert(childInfo, function (err, childResponse) {
      if (err) {
        console.log(err.message);
        errorStack.push(err.message);
        resolve(err.message);
//        reject(err);
      } else {
        var statusInfo = calculateStatus(screeningInfo);
        statusInfo.screeningObj._id = 'scr_' + dataBase + '_' + moment();
        statusInfo.screeningObj.owner = childResponse.id;
        stakeDb.insert(statusInfo.screeningObj, function (err, scrResponse) {
          if (err) {
            console.log(err.message);
            errorStack.push(err.message);
            resolve(err.message);
//            reject(err);
          } else {
            childInfo.lastScreening = scrResponse.id;
            childInfo._rev = childResponse.rev;
            childInfo.zscoreStatus = statusInfo.zscoreStatus;
            childInfo.statusColor = statusColor(statusInfo.zscoreStatus);
            stakeDb.insert(childInfo, function (err, response) {
              if (err) {
                console.log(err.message);
                errorStack.push(err.message);
                resolve(err.message);
//                reject(err);
              } else {
                resolve('update complete');
              }
            });
          }
        });
      }
    });
  });
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

function buildObject(input) {
  return new Promise(function(resolve, reject) {
    var i = 0;
    var k = 0;
    var columnData = input.results;
    var colIndexes = Object.keys(columnData.data[0]);
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

    for (i = 1; i < columnData.data[0].length; i++) {
      if (~columnData.data[0][i].indexOf('firstName')) {
        firstNameIndex = i;
      } else if (~columnData.data[0][i].indexOf('lastName')) {
        lastNameIndex = i;
      } else if (~columnData.data[0][i].indexOf('mother')) {
        motherIndex = i;
      } else if (~columnData.data[0][i].indexOf('father')) {
        fatherIndex = i;
      } else if (~columnData.data[0][i].indexOf('birthdate')) {
        birthDateIndex = i;
      } else if (~columnData.data[0][i].indexOf('address')) {
        addressIndex = i;
      } else if (~columnData.data[0][i].indexOf('city')) {
        cityIndex = i;
      } else if (~columnData.data[0][i].indexOf('ward')) {
        wardIndex = i;
      } else if (~columnData.data[0][i].indexOf('phone')) {
        phoneIndex = i;
      } else if (~columnData.data[0][i].indexOf('age')) {
        monthAgeIndex = i;
      } else if (~columnData.data[0][i].indexOf('gender')) {
        genderIndex = i;
      } else if (~columnData.data[0][i].indexOf('weight')) {
        weightIndex = i;
      } else if (~columnData.data[0][i].indexOf('height')) {
        heightIndex = i;
      } else if (~columnData.data[0][i].indexOf('ha')) {
        haIndex = i;
      } else if (~columnData.data[0][i].indexOf('wa')) {
        waIndex = i;
      } else if (~columnData.data[0][i].indexOf('wh')) {
        whIndex = i;
      } else if (~columnData.data[0][i].indexOf('lds')) {
        ldsIndex = i;
      } else if (~columnData.data[0][i].indexOf('screenDate')) {
        surveyDateIndex = i;
      } else if (~columnData.data[0][i].indexOf('idGroup')) {
        idGroupIndex = i;
      } else if (~columnData.data[0][i].indexOf('status')) {
        statusIndex = i;
      }else {
        console.log(columnData.data[0][i]);
      }
    }

    var dataBaseObj = [];
    var j;
    for (j = 1; j < columnData.data.length-1; j++) {
      var childObj = {};
      var screenObj = {zScore: { ha:'',haStatus:'', wa:'',waStatus:'', wl:'', wlStatus:''}};
      childObj.birthDate = columnData.data[j][birthDateIndex];
      childObj.firstName = columnData.data[j][firstNameIndex];
      childObj.lastName = columnData.data[j][lastNameIndex];
      childObj.mother = motherIndex !== 0 ? columnData.data[j][motherIndex] : undefined;
      childObj.father = fatherIndex !== 0 ? columnData.data[j][fatherIndex] : undefined;
      childObj.address = addressIndex !== 0 ? columnData.data[j][addressIndex] : undefined;
      childObj.city = cityIndex !== 0 ? columnData.data[j][cityIndex] : undefined;
      childObj.ward = wardIndex !== 0 ? columnData.data[j][wardIndex] : undefined;
      childObj.phone = phoneIndex !== 0 ? columnData.data[j][phoneIndex] : undefined;
      childObj.monthAge = columnData.data[j][monthAgeIndex];
      childObj.gender = columnData.data[j][genderIndex];
      childObj.lds = columnData.data[j][ldsIndex];
      childObj.idGroup = columnData.data[j][idGroupIndex];
      screenObj.surveyDate = columnData.data[j][surveyDateIndex];
      screenObj.monthAge = columnData.data[j][monthAgeIndex];
      screenObj.gender = columnData.data[j][genderIndex];
      screenObj.weight = columnData.data[j][weightIndex];
      screenObj.height = columnData.data[j][heightIndex];
      screenObj.zScore.ha = columnData.data[j][haIndex];
      screenObj.zScore.wa = columnData.data[j][waIndex];
      screenObj.zScore.wl = columnData.data[j][whIndex];
      dataBaseObj.push (saveTheObjects(input.dataBase, childObj, gradeZScores(screenObj)));
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
        buildObject ({dataBase: req.params.stakeDB, results: parsedData})
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
