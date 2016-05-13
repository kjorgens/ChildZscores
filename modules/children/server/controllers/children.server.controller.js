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
  // configEnvy = require('config-envy')({
  //   env: process.env.NODE_ENV, // The environment config to pull from. Will be based on the `env` property of the lane
  //   cwd: process.cwd(), // The current working directory to base storage options from
  //   localEnv: '.env', // The path to an overriding .env for the local environment
  //   overrideProcess: false, // Set to true if you want the existing environment variables to be overridden by your .env files
  //   silent: false // Set to true if you want to be notified of any errors that happen when trying to read your .env files
  // });

function getOwnerData(input) {
  return new Promise(function(resolve, reject) {
//    console.log('at get owner data input.screening.id = ' + input.screening.id);
    var screenData = input.screening;
    request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
        '/' + input.req.params.stakeDB + '/' + input.screening.key.owner, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var ownerInfo = JSON.parse(body);
        input.ownerInfo = ownerInfo;
        input.screenInfo = screenData;
        resolve(addLineToFile(input));

      } else {
        resolve(input);
      }
    });
  });
}

function pullSaveScreenData(input) {
  return new Promise(function(resolve, reject) {
    request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
        '/' + input.req.params.stakeDB + '/_design/scr_list/_view/screen', function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj = JSON.parse(body);
        var screenList = [];
        jsonObj.rows.forEach(function(screening) {
          input.screening = screening;
          screenList.push(getOwnerData(input));
        });
        resolve(screenList);
      } else {
        reject(error);
      }
    });
  });
}

function insertHeaderLine(input) {
  return new Promise(function(resolve, reject) {
    var headerLine = 'id,gender,firstName,lastName,mother,phone,address,ward,lds,weight,height,age,ha,wa,wh\n';
    input.fileDis.write(headerLine, function(err) {
      if (err) {
        console.log(err);
      }
 //     console.log('header written');
      resolve(input);
    });
  });
}

function addLineToFile(input) {
  return new Promise(function (resolve, reject) {
    var dataLine = input.screenInfo.id + ',' + input.screenInfo.key.gender + ',' + input.ownerInfo.firstName + ',' + input.ownerInfo.lastName +
        ',' + input.ownerInfo.mother + ',' + input.ownerInfo.phone + ',' + input.ownerInfo.address + ',' + input.ownerInfo.ward +
        ',' + input.ownerInfo.memberStatus + ',' + input.screenInfo.key.weight + ',' + input.screenInfo.key.height + ',' + input.screenInfo.key.monthAge +
        ',' + input.screenInfo.key.zScore.ha + ',' + input.screenInfo.key.zScore.wa + ',' + input.screenInfo.key.zScore.wl + '\n';
    input.fileDis.write(dataLine, function(err) {
      if (err) {
        console.log(err);
        reject(err);
      }
//      console.log('just wrote ' + dataLine);
      resolve(input);
    });
  });
}

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

exports.createCSVFromDB = function (req, res) {
  var fstream = fs.createWriteStream( 'files/' + req.params.stakeDB + '.csv');
  var paramObj = { res: res, req: req, fileDis: fstream, ownerInfo: {}, screening: {}};

  function reportCSVComplete() {
    res.status (200).send ({
      message: 'files/' + req.params.stakeDB + '.csv'
    });
  }

  insertHeaderLine(paramObj).catch(function(err) {
    console.log(err);
  })
    .then(pullSaveScreenData).catch(function(err) {
      console.log(err);
    })
    .all().catch(function(err) {
      console.log(err);
    })
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
