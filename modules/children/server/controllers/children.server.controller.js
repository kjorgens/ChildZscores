'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Child = mongoose.model('Child'),
  request = require('request'),
  fs = require('fs'),
  Promise = require('bluebird'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

function getOwnerData(parmObj) {
  return new Promise(function(resolve, reject) {
    var couchURL;
    if(process.env.COUCH_URL.indexOf('localhost') > -1 ){
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
        parmObj.sortField = sortField;
        resolve(addLineToStack(parmObj));
      } else {
        resolve();
      }
    });
  });
}

function pullSaveScreenData(parmObj) {
  return new Promise(function(resolve, reject) {
    var couchURL;
    var ddoc = parmObj.filter.indexOf('all') > -1 ? 'scr_list' : 'zscore_kids';
    if(process.env.COUCH_URL.indexOf('localhost') > -1 ){
      couchURL = 'http://' + process.env.COUCH_URL + '/';
    } else {
      couchURL = 'https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/';
    }
    request.get(couchURL + parmObj.stakeDB +
        '/_design/' + ddoc + '/_view/screen', function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj = JSON.parse(body);
        var screenList = [];
        jsonObj.rows.forEach(function(screening) {
          parmObj.screenInfo = screening;
          screenList.push(getOwnerData(parmObj));
        });
        resolve(screenList);
      } else {
        reject(response);
      }
    });
  });
}

function gatherScreeningInfo(parmObj) {
  return new Promise(function(resolve, reject) {
    var headerLine = 'id,gender,firstName,lastName,idGroup,mother,phone,address,ward,lds,weight,height,age,ha,wa,wh\n';
    parmObj.fdis.write(headerLine, function(err) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve (pullSaveScreenData(parmObj).all());
      }
    });
  });
}

function writeTheLine(fileDis,line){
  return new Promise(function(resolve,reject){
    fileDis.write(line, function(err) {
      if (err) {
        console.log (err);
      }
      resolve();
    });
  })
}

function writeEm(sortedList){
  return new Promise(function(resolve,reject){
    var writeStack = [];
    sortedList.forEach(function(line){
      writeStack.push(writeTheLine(line.fdis,line.dataLine));
    });
    resolve(writeStack);
  })
}

function addLineToStack(parmObj) {
  return new Promise(function (resolve, reject) {
    var cleanAddr;
    if(parmObj.ownerInfo.address != undefined && parmObj.ownerInfo.address.indexOf(',') > -1){
      parmObj.ownerInfo.address = parmObj.ownerInfo.address.replace(/,/g,' ');
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
      wl: parmObj.screenInfo.zScore.wl
    };
    var dataLine = dataObj.childId + ',' + dataObj.gender + ',' + dataObj.firstName + ',' + dataObj.lastName +
        ',' + dataObj.idGroup + ',' + dataObj.mother + ',' + dataObj.phone + ',' + dataObj.address +
        ',' + dataObj.ward + ',' + dataObj.memberStatus + ',' + dataObj.weight + ',' + dataObj.height +
        ',' + dataObj.age + ',' + dataObj.ha + ',' + dataObj.wa + ',' + dataObj.wl + '\n';
  //  parmObj.lineStack.push(dataLine);
    resolve({data: dataObj, dataLine: dataLine, fdis: parmObj.fdis, sort: parmObj.sort});
  });
}

function sortEm(listIn) {
  return new Promise (function (resolve, reject) {
    listIn.sort (function (x, y) {
      // console.log(x.data[x.sort] + ' ' + y.data[x.sort]);
      if (x.data[x.sort] < y.data[x.sort]) {
        return -1;
      }
      if (x.data[x.sort] > y.data[x.sort]) {
        return 1;
      }
      if (x.data[x.sort] === y.data[x.sort]) {
        return 0;
      }
    });
    resolve (listIn);
  })
}

exports.createCSVFromDB = function (req, res) {
  var fstream = fs.createWriteStream( 'files/' + req.params.stakeDB + '.csv');
//  var paramObj = { res: res, req: req, fileDis: fstream, ownerInfo: {}, screening: {}};

  // var lineStack = [];
  function reportCSVComplete(input) {
    res.status (200).send ({
      message: 'files/' + req.params.stakeDB + '.csv'
    });
  }
  var parmObj = {fdis: fstream, stakeDB: req.params.stakeDB, filter: req.params.filter, sort: req.params.sort, screenInfo: {}};
  gatherScreeningInfo(parmObj).catch(function(err) {
    console.log(err);
  })
  .all().then(sortEm)
  .then(writeEm).catch(function(err) {
    console.log(err);
  })
   .all()
      .then(reportCSVComplete);
};

exports.getSyncURL = function(req, res) {
  return res.json({ entity: process.env.SYNC_ENTITY, url: process.env.COUCH_URL });
};

exports.getCountryList = function(req, res) {
  request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
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
    }
    else {
      console.log('Sent:', input[0].req.params.stakeDB + '.csv');
    }
  });
  //     .send({
  //   message: 'files/' + req.params.stakeDB + '.csv'
  // });
}
/**
 * Child middleware
 */
// exports.childByID = function (req, res, next, id) {
//
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).send({
//       message: 'Child is invalid'
//     });
//   }
//
//   Child.findById(id).populate('user', 'displayName').exec(function (err, child) {
//     if (err) {
//       return next(err);
//     } else if (!child) {
//       return res.status(404).send({
//         message: 'No child with that identifier has been found'
//       });
//     }
//     req.child = child;
//     next();
//   });
// };
