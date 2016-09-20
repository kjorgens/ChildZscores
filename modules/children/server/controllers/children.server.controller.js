'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  request = require('request'),
  fs = require('fs'),
  // csvParse = require('babyparse'),
  moment = require('moment'),
  csvloader = require('multer'),
  config = require(path.resolve('./config/config')),
  Promise = require('bluebird'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

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
        myError.name = 'database error';
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject(myError);
        } else {
          var reasons = JSON.parse(response.body);
          msg = 'Database Error: ' + response.statusCode + ': ' + response.statusMessage + '  Error:' + reasons.error + ' Reason: ' + reasons.reason;
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
        var myError = new Error();
        myError.name = 'database error';
        if (error) {
          myError.message = error;
          myError.name = 'database error';
          reject(myError);
        } else {
          var reasons = JSON.parse(response.body);
          msg = 'Database Error: ' + response.statusCode + ': ' + response.statusMessage + '  Error:' + reasons.error + ' Reason: ' + reasons.reason;
          myError.message = msg;
          reject(myError);
        }
      }
    });
  });
}

// function writeFirstRow(fstream) {
//   return new Promise(function(resolve, reject) {
//
//     fstream.write(headerLine, function(err) {
//       if (err) {
//         console.log(err);
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

function writeTheFile(input) {
  return new Promise(function(resolve, reject) {
    var headerLine = 'id,gender,firstName,lastName,idGroup,mother,phone,address,ward,lds,weight,height,age,ha,wa,wh,status\n';
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
      idGroup: parmObj.ownerInfo.idGroup,
      mother: parmObj.ownerInfo.mother,
      phone: parmObj.ownerInfo.phone,
      address: parmObj.ownerInfo.address,
      ward: parmObj.ownerInfo.ward || 'none specified',
      memberStatus: parmObj.ownerInfo.memberStatus,
      weight: parmObj.screenInfo.weight,
      height: parmObj.screenInfo.height,
      age: parmObj.screenInfo.monthAge,
      ha: parmObj.screenInfo.zScore.ha,
      wa: parmObj.screenInfo.zScore.wa,
      wl: parmObj.screenInfo.zScore.wl,
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
    var dataLine = dataObj.childId + ',' + dataObj.gender + ',' + dataObj.firstName + ',' + dataObj.lastName +
        ',' + dataObj.idGroup + ',' + dataObj.mother + ',' + dataObj.phone + ',' + dataObj.address +
        ',' + dataObj.ward + ',' + dataObj.memberStatus + ',' + dataObj.weight + ',' + dataObj.height +
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

  function reportCSVUploadComplete(input) {
    res.status(200).send({
      message: 'file upload complete'
    });
  }
  var parmObj = { stakeDB: req.params.stakeDB, filter: req.params.filter, sortField: req.params.sortField, screenInfo: {} };
  pullSaveScreenData(parmObj)
    //   .catch(function(err) {
    // return res.status(500).send({
    //   message: 'file upload complete'
    // });
  .all().then(sortEm)
    // .catch(function(err) {
    // return res.status(500).send({
    //   message: 'file upload complete'
    // });
  .then(collectEm)
    // .catch(function(err) {
    // return res.status(500).send({
    //   message: 'file upload complete'
    // });
  .then(writeTheFile)
  .then(reportCSVComplete).catch(function(err) {
    res.status(500).send({
      error: err
    });
    // return res.status(500).send({
    //   message: 'Error downloading csv'
    // });
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

function infoToCouch (dataBase, record) {
  return new Promise(function(resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + dataBase);
    stakeDb.insert({ _id: 'scr_' + dataBase + '_' + moment.now() }, function(err, response) {
      if (err) {
        console.log(err.message);
        reject(err.message);
      } else {
        stakeDb.insert({ _id: 'chld_' }, function(err, response){
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

function weHaveData(results) {
  // return new Promise(function(resolve, reject) {
  var rows = results[0].data;
  console.log('results are in');
    // resolve(results);
  // });
}

function locateOwner(data) {
  return new Promise(function(resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + dataBase);
  });
}

function parseCsv(input) {
 // return new Promise(function(resolve, reject) {
//  csvParse.parseFiles(input.file, { dynamicTyping: true, complete: weHaveData });

 // });
}

exports.uploadCsv = function (req, res) {
  // var user = req.user;
  var upload = csvloader(config.uploads.csvUpload).single('newUploadCsv');
  var csvUploadFileFilter = require(path.resolve('./config/lib/csvloader.js')).csvUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = csvUploadFileFilter;

  upload(req, res, function (uploadError) {
    if (uploadError) {
      return res.status(400).send({
        message: 'Error occurred while uploading csv file'
      });
    } else {
      // parse csv
      // parseCsv(res.req.file.path);
      // csvParse.parseFiles(res.req.file.path, { header: true, dynamicTyping: true, complete: function(results, file) {
      //   var input = results;
      return (res.status(200).send({ message: 'update complete' }));
    }
  });
     // });
          // .then(res.status(200).send({ message: 'update complete' }));

      // locate a child (gender, first name, last name, age +- 1 month, mother
      // and populate db with new screening and possibly new child
  // console.log('the file ' + res.req.file.originalname + ' is saved as ' + res.req.file.path);

//    }
//  });
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
