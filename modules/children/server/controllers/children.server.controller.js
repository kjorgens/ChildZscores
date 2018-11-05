'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  jwt_decode = require('jwt-decode'),
  request = require('request'),
  fs = require('fs'),
  csvParse = require('babyparse'),
  moment = require('moment'),
  uuid = require('uuid4'),
  csvloader = require('multer'),
  config = require(path.resolve('./config/config')),
  Promise = require('bluebird'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var retryLimit = 5;

var errorStack = [];

var filterList = [
  {
    '_id': '_design/filter_ddocs',
    'filters': {
      'ddocs': 'function(doc, req) {if(doc._id[0] != \'_\') {return true} else {return false}  }'
    }
  },
];

var viewList = [
  {
    '_id': '_design/children_list',
    'views': {
      'screen': {
        'map': 'function(doc){if(doc.zscoreStatus && !doc.deliveryDate && !doc.childsBirthDate){emit(doc)}}'
      }
    }
  },
  {
    '_id': '_design/name_search',
    'views': {
      'find_by_name': {
        'map': 'function(doc){emit([doc.firstName, doc.lastName, doc.birthDate], doc)}'
      }
    }
  },
  {
    '_id': '_design/scr_list',
    'views': {
      'screen': {
        'map': 'function(doc){if(doc.owner){emit(doc)}}'
      }
    }
  },
  {
    '_id': '_design/screen_search',
    'views': {
      'find_by_owner': {
        'map': 'function(doc){emit([doc.owner, doc.surveyDate], doc)}'
      }
    }
  },
  {
    '_id': '_design/zscore_kids',
    'views': {
      'screen': {
        'map': 'function(doc){if(doc.zScore.ha < -2 || doc.zScore.wa < -2 || doc.zScore.wl < -2){emit(doc)}}'
      }
    }
  },
  {
    '_id': '_design/pregnant_women',
    'views': {
      'screen': {
        'map': 'function(doc){if(doc.deliveryDate){emit(doc)}}'
      }
    }
  },
  {
    '_id': '_design/nursing_mothers',
    'views': {
      'screen': {
        'map': 'function(doc){if(doc.childsBirthDate){emit(doc)}}'
      }
    }
  },
  {
    '_id': '_design/scr_owner_search',
    'views': {
      'find_by_owner': {
        'map': 'function(doc){emit(doc.owner, doc)}'
      }
    }
  },
];

var removeFilterList = [
  {
    '_id': '_design/screenings_search',
  },
];

function validateView(type, stakeDB, view) {
  return new Promise(function(resolve, reject) {
    console.log('inside validateView');
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + stakeDB);
    var viewObject;
    if (~type.indexOf('view')) {
      viewObject = { _id: view._id, views: view.views };
    }
    if (~type.indexOf('filter')) {
      viewObject = { _id: view._id, filters: view.filters };
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
        viewObject._rev = body._rev;
        stakeDb.insert(viewObject, function(err, response) {
          if (err) {
            var updateError = new Error(err.message);
            console.log(err.message);
            reject(updateError);
          } else {
            console.log('view ' + view._id + ' created in ' + stakeDB);
            resolve('view ' + view._id + ' created in ' + stakeDB);
          }
        });
        resolve(view._id + ' updated');
      }
    });
  });
}

function removeView(type, stakeDB, view) {
  return new Promise(function (resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + stakeDB);

    stakeDb.get(view._id, function (err, body) {
      if (!err) {
        stakeDb.destroy(view._id, body.doc.rev, function (err, response) {
          if (err) {
            var updateError = new Error(err.message);
            console.log(err.message);
            reject(updateError);
          } else {
            console.log('view ' + view._id + ' destroyed ' + stakeDB);
            resolve('view ' + view._id + ' destroyed in ' + stakeDB);
          }
        });
      }
      resolve('no view to remove');
    });
  });
}

exports.checkUpdateViews = function (req, res) {
  var toCheck = [];
  console.log('inside checkUpdateViews');
  viewList.forEach(function (view) {
    toCheck.push(validateView('view', req.params.stakeDB, view));
  });
  filterList.forEach(function (filter) {
    toCheck.push(validateView('filter', req.params.stakeDB, filter));
  });
  removeFilterList.forEach(function (filter) {
    toCheck.push(removeView('remove', req.params.stakeDB, filter));
  });

  var allViews = Promise.all(toCheck);
  allViews.then(function(input) {
    return (res.status(200).send({ message: input }));
  }).catch(function (error) {
    return res.status(400).send({
        message: errorHandler.getErrorMessage(error)
      }
    );
  });
};

function getScreeningsList(childId, screeningList) {
  var screenList = [];
  screeningList.forEach(function(screenEntry) {
    if (screenEntry.key.owner === childId) {
      screenList.push(screenEntry.key);
    }
  });
  if (screenList.length === 0) {
    console.log('no screens found for ' + childId);
  } else {
    screenList.sort(function (x, y) {
      if (x.surveyDate > y.surveyDate) {
        return -1;
      }
      if (x.surveyDate < y.surveyDate) {
        return 1;
      }
      if (x.surveyDate === y.surveyDate) {
        return 0;
      }
      return 0;
    });
  }

  return screenList;
}

function splitSups(childScreenList) {
  const supList = childScreenList.listIn.filter(child => child.data.sup !== 'none' && child.data.sup !== 'risk' && child.data.sinceLastScreen < 6);
  const others = childScreenList.listIn.filter(child => child.data.sup === 'none' || child.data.sup === 'risk' || child.data.sinceLastScreen > 6);
  return { listIn: [...supList, ...others] };
}

function listAllChildren(childScreenList, screenType) {
  var childCount = 0;
  var sortedScreenList = [];
  var noScreenings = 0;
  var supType = 'none';
  var currentSupType = 'none';
  var timeSinceLastScreen;
  var priorMalnurished = 'no';
  var lineAccumulator = [];

  if (childScreenList[0].data.total_rows > 0) {
    childScreenList[0].data.rows.forEach(function (childEntry) {
      var currentAge = moment().diff(moment(new Date(childEntry.key.birthDate)), 'months');
        if (!~childEntry.id.indexOf('mthr')) {
          if (screenType === 'sup') {
            if (currentAge < 60 && ~childEntry.id.indexOf('chld')) {
              sortedScreenList = getScreeningsList(childEntry.id, childScreenList[1].data.rows);
              if (sortedScreenList.length === 0) {
                noScreenings++;
                lineAccumulator.push(addChildToLine(childEntry.key, sortedScreenList[0], childScreenList[0].parms.sortField, childScreenList[0].parms.stakeDB, childScreenList[0].parms.filter, ' ', 100, 'no', childScreenList[0].language));
              } else {
                supType = 'none';
                priorMalnurished = 'no';
                currentSupType = 'none';
                sortedScreenList.forEach(function (screening, index) {
                  // if ((screening.zScore.ha > -2 && screening.zScore.ha < -1) || (screening.zScore.wa > -2 && screening.zScore.wa < -1)) {
                  //   supType = 'risk';
                  // }
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
                timeSinceLastScreen = moment().diff(moment(new Date(sortedScreenList[0].surveyDate)), 'months');

                lineAccumulator.push(addChildToLine(childEntry.key, sortedScreenList[0], childScreenList[0].parms.sortField, childScreenList[0].parms.stakeDB,
                  childScreenList[0].parms.filter, currentSupType, timeSinceLastScreen, priorMalnurished, childScreenList[0].parms.language));
              }
            }
          } else if (screenType === 'all') {
            try {
              if (childScreenList[1].data.total_rows > 0) {
                sortedScreenList = getScreeningsList(childEntry.id, childScreenList[1].data.rows);
                let screenCount = 1;
                sortedScreenList.forEach(function (entry) {
                  lineAccumulator.push(addLineToStack(childCount, screenCount, childEntry.key, entry, childScreenList[0].parms.sortField, childScreenList[0].stake, childScreenList[0].stakeName, childScreenList[0].parms.language));
                  childCount++;
                  screenCount++;
                });
              }
            } catch (err) {
              console.log(err.message);
            }
          }
        } else {
          try {
            if (childScreenList[1].data.total_rows > 0) {
              sortedScreenList = getScreeningsList(childEntry.id, childScreenList[1].data.rows);
              let screenCount = 1;
              sortedScreenList.forEach(function (entry) {
                lineAccumulator.push(addLineToStack(childCount, screenCount, childEntry.key, entry, childScreenList[0].parms.sortField, childScreenList[0].stake, childScreenList[0].stakeName, childScreenList[0].parms.language));
                childCount++;
                screenCount++;
              });
            }
          } catch (err) {
            console.log(err.message);
          }
        }
    });
  }

  return lineAccumulator;
}

function listWomen(womanScreenList) {
  var count = 0;
  var linesToAdd = [];

  womanScreenList.forEach(function (dataSet) {
    if (dataSet[0].data.total_rows > 0) {
      dataSet[0].data.rows.forEach(function (childEntry) {
        linesToAdd.push(addWomenToStack(childEntry.key, dataSet[0].stake, dataSet[0].parms.sortField, dataSet[0].parms.filter, dataSet[0].parms.language));
        count++;
      });
    }
    if (dataSet[1].data.total_rows > 0) {
      dataSet[1].data.rows.forEach(function (childEntry) {
        linesToAdd.push(addWomenToStack(childEntry.key, dataSet[1].stake, dataSet[1].parms.sortField, dataSet[1].parms.filter, dataSet[1].parms.language));
        count++;
      });
    }
  });
  return linesToAdd;
}

function newDBRequest(stake, stakeName, parmObj, view) {
  return new Promise(function(resolve, reject) {
    try {
      var couchURL;
      if (process.env.COUCH_URL.indexOf('localhost') > -1) {
        couchURL = 'http://' + process.env.COUCH_URL + '/';
      } else {
        couchURL = 'https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/';
      }
      var newObj = Object.assign({}, parmObj);
      request.get(couchURL + stake + '/_design/' + view + '/_view/screen', (error, response) => {
        if (!error && response.statusCode === 200) {
          var jsonObj;
          try {
            jsonObj = JSON.parse(response.body);
            resolve({ stake: stake, stakeName: stakeName, parms: newObj, data: jsonObj, view: view });
          } catch (e) {
             console.log('Error JSON.Parse dbRequest');
            reject(e);
            // resolve({ stake: stake, stakeName: stakeName, parms: newObj, data: [], view: view });
          }
        } else {
          try {
            console.log(`${ response.statusCode } returned from couch access ${ stake }`);
          } catch(err) {
            console.log(err);
          }
          // resolve({ stake: stake, stakeName: stakeName, parms: newObj, data: {}, view: view });
          reject(new Error(`${ response.statusCode } returned from couch access ${ stake }`));
        }
      });
    } catch(err) {
      console.log(err.message);
      reject(err);
    }
  });
}

function getWomen(parmObj) {
  var newObj = Object.assign({},parmObj);
  var stake = parmObj.stakeDB;
  return Promise.join(newDBRequest(stake, parmObj.stakename, newObj, 'pregnant_women'), newDBRequest(stake, parmObj.stakename, newObj, 'nursing_mothers'));
}

async function getChildAndData(parmObj, multiplier) {
  return new Promise((resolve) => {
    function accessDB(parmObj) {
      var newObj = Object.assign({},parmObj);
      var stake = parmObj.stakeDB;
      return resolve(Promise.join(newDBRequest(stake, parmObj.stakename, newObj, 'children_list'), newDBRequest(stake, parmObj.stakename, newObj, 'scr_list')));
    }
    return setTimeout(accessDB, 1000*multiplier, parmObj);
  });
}

async function writeHeader(fileToWrite, headerLine) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`files/${ fileToWrite }`, headerLine, (err) => {
      if (err) {
        console.log(err);
        reject(err.message);
      } else {
        console.log('saving header');
        resolve(fileToWrite);
      }
    });
  })
}

async function appendStake(fileToWrite, data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(`files/${ fileToWrite }`, data, (err) => {
      if (err) {
        console.log(err);
        reject(err.message);
      }
      resolve(fileToWrite);
    });
  });
}

function addChildToLine(existingOwnerInfo, screenInfo, sortField, stakeDB, filter, supType, timeSinceLastScreen, priorMalNurish, language) {
  const ownerInfo = existingOwnerInfo;
  ownerInfo.sup = supType;
  ownerInfo.sinceLastScreen = timeSinceLastScreen;
  if (typeof ownerInfo.mother === 'string' && ownerInfo.mother.indexOf(',') > -1) {
    ownerInfo.mother = ownerInfo.mother.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.firstName === 'string' && ownerInfo.firstName.indexOf(',') > -1) {
    ownerInfo.firstName = ownerInfo.firstName.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.lastName === 'string' && ownerInfo.lastName.indexOf(',') > -1) {
    ownerInfo.lastName = ownerInfo.lastName.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.phone === 'string' && ownerInfo.phone.indexOf(',') > -1) {
    ownerInfo.phone = ownerInfo.phone.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.ward === 'string' && ownerInfo.ward.indexOf(',') > -1) {
    ownerInfo.ward = ownerInfo.ward.replace(/,/g, ' ');
  }
  var dataLine;
  var currentAge = moment().diff(moment(new Date(ownerInfo.birthDate)), 'months');
  var priorMessage = language === 'en' ? `${ priorMalNurish }` : `${ priorMalNurish === 'yes' ? 'si' : 'no' }`;
  if (supType.indexOf('risk') > -1) {
    var message = language === 'en' ? ` months since last screening\n` :
      ` meses desde la última evaluación\n`;
    dataLine = '' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward +
      ',' + ownerInfo.mother + ',' + timeSinceLastScreen + message;
    return ({
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      atRisk: true,
      language: language
    });
  } else if (supType.indexOf('none') > -1) {
    var message = language === 'en' ? ` months since last screening\n` :
      ` meses desde la última evaluación\n`;
    dataLine = '' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward +
      ',' + ownerInfo.mother + ',' + timeSinceLastScreen + message;
    return ({
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      normalZscore: true,
      language: language
    });
  } else if (screenInfo === undefined || timeSinceLastScreen > 6) {
    if (timeSinceLastScreen === undefined || timeSinceLastScreen === 100) {
      var messageProb = language === 'en' ? ' no screenings: possible duplicate?\n' : ' sin proyecciones: posible duplicado?\n';
      dataLine = '' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward +
        ',' + ownerInfo.mother + ',' + messageProb;
    } else {
      var messageRisk = language === 'en' ? `  months since last screening\n` :
        ` meses desde la última evaluación , Niño en riesgo: debería pasar a la siguiente evaluación\n`;
      dataLine = '' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward +
        ',' + ownerInfo.mother + ',' + timeSinceLastScreen + messageRisk;
    }
    return ({
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      missedScreen: true,
      language: language
    });
  } else {
    dataLine = '' + ',' + ',' + ',' + ',' + ',,' + supType + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName +
      ',' + ownerInfo.ward + ',' + ownerInfo.mother + '\n';
    return ({
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      language: language
    });
  }
}

function addLineToStack(childCount, screenCount, ownerInfo, screenInfo, sortField, stakeDB, stakeName, language) {
  if (typeof ownerInfo.address === 'string' && ownerInfo.address.indexOf(',') > -1) {
    ownerInfo.address = ownerInfo.address.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.mother === 'string' && ownerInfo.mother.indexOf(',') > -1) {
    ownerInfo.mother = ownerInfo.mother.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.father === 'string' && ownerInfo.father.indexOf(',') > -1) {
    ownerInfo.father = ownerInfo.father.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.city === 'string' && ownerInfo.city.indexOf(',') > -1) {
    ownerInfo.city = ownerInfo.city.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.ward === 'string' && ownerInfo.ward.indexOf(',') > -1) {
    ownerInfo.ward = ownerInfo.ward.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.firstName === 'string' && ownerInfo.firstName.indexOf(',') > -1) {
    ownerInfo.firstName = ownerInfo.firstName.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.lastName === 'string' && ownerInfo.lastName.indexOf(',') > -1) {
    ownerInfo.lastName = ownerInfo.lastName.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.idGroup === 'string' && ownerInfo.idGroup.indexOf(',') > -1) {
    ownerInfo.idGroup = ownerInfo.idGroup.replace(/,/g, ' ');
  }
  if (typeof ownerInfo.phone === 'string' && ownerInfo.phone.indexOf(',') > -1) {
    ownerInfo.phone = ownerInfo.phone.replace(/,/g, ' ');
  }
  if (!ownerInfo.firstName) {
    console.log('firstName invalid');
    ownerInfo.firstname = 'unknown';
  }
  if (!ownerInfo.lastName) {
    console.log('lastName invalid');
    ownerInfo.lastName = 'unknown';
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
    screeningID: screenInfo.id,
    weight: screenInfo.weight,
    height: screenInfo.height,
    age: screenInfo.monthAge,
    ha: screenInfo.zScore.ha,
    wa: screenInfo.zScore.wa,
    wl: screenInfo.zScore.wl,
    surveyDate: screenInfo.surveyDate,
    screenId: screenInfo._id
  };

  const zscoreStatus = calculateStatus(screenInfo);
   var dataLine = childCount + ',' + stakeDB + ',' + screenCount + ',' + dataObj.childId + ',' + dataObj.gender + ',' + dataObj.firstName + ',' + dataObj.lastName + ',' + dataObj.birthDate +
        ',' + dataObj.idGroup + ',' + dataObj.mother + ',' + dataObj.father + ',' + dataObj.phone + ',' + dataObj.address +
        ',' + dataObj.city + ',' + dataObj.ward + ',' + dataObj.memberStatus + ',' + dataObj.screenId + ',' + dataObj.surveyDate +
        ',' + dataObj.weight + ',' + dataObj.height + ',' + dataObj.age + ',' + dataObj.ha + ',' + dataObj.wa + ',' + dataObj.wl + ',' + zscoreStatus.zscoreStatus + '\n';
  return { data: dataObj, dataLine: dataLine, stakeDB: stakeDB, stakeName: stakeName, sortField: sortField, filter: 'listall' };
}

function addWomenToStack(input, stakeDB, sortField, filter, language) {
  var parmObj = input;
  // return new Promise(function (resolve, reject) {
    if (parmObj.address !== undefined && parmObj.address.indexOf(',') > -1) {
      parmObj.address = parmObj.address.replace(/,/g, ' ');
    }
    if (parmObj.city !== undefined && parmObj.city.indexOf(',') > -1) {
      parmObj.city = parmObj.city.replace(/,/g, ' ');
    }
    if (parmObj.ward !== undefined && parmObj.ward.indexOf(',') > -1) {
      parmObj.ward = parmObj.ward.replace(/,/g, ' ');
    }
    if (parmObj.firstName !== undefined && parmObj.firstName.indexOf(',') > -1) {
      parmObj.firstName = parmObj.firstName.replace(/,/g, ' ');
    }
    if (parmObj.lastName !== undefined && parmObj.lastName.indexOf(',') > -1) {
      parmObj.lastName = parmObj.lastName.replace(/,/g, ' ');
    }
    var dataObj = {
      childId: parmObj._id,
      firstName: parmObj.firstName,
      lastName: parmObj.lastName,
      city: parmObj.city || '',
      phone: parmObj.phone || '',
      address: parmObj.address || '',
      ward: parmObj.ward || '',
      memberStatus: parmObj.memberStatus || '',
      surveyDate: parmObj.created,
      screenId: parmObj._id
    };
    if (parmObj.childsBirthDate) {
      dataObj.childsBirthDate = parmObj.childsBirthDate;
    } else {
      dataObj.deliveryDate = parmObj.deliveryDate;
    }

    var dataLine = dataObj.childId + ',' + dataObj.firstName + ',' + dataObj.lastName + ',' +
        ',' + dataObj.phone + ',' + dataObj.address +
        ',' + dataObj.city + ',' + dataObj.ward + ',' + dataObj.memberStatus + ',' + dataObj.surveyDate;
    if (parmObj.childsBirthDate) {
      dataLine = dataLine + ',' + dataObj.childsBirthDate + '\n';
    } else {
      dataLine = dataLine + ',' + dataObj.deliveryDate + '\n';
    }
    return { data: dataObj, dataLine: dataLine, stakeDB: stakeDB, sortField: sortField, filter: filter, language: language };
  // });
}

function buildOutputData(listIn) {
  let accumulate = '';
  listIn.listIn.forEach(function (child) {
    accumulate = accumulate.concat(child.dataLine);
  });
  return accumulate;
}

function sortList(listIn) {
  listIn.forEach(function(entry, index) {
    if (entry.sortField === undefined) {
      listIn[index].sortField = 'firstName';
    }
  });
  try {
    listIn.sort(function (x, y) {
      try {
        if (x.data[x.sortField].toUpperCase() < y.data[x.sortField].toUpperCase()) {
          return -1;
        }
      } catch(err){
        console.log(err);
      }
      if (x.data[x.sortField].toUpperCase() > y.data[x.sortField].toUpperCase()) {
        return 1;
      }
      if (x.data[x.sortField].toUpperCase() === y.data[x.sortField].toUpperCase()) {
        return 0;
      }
      return 0;
    });
  }
  catch(err) {
    console.log(err);
  }

  return { listIn: listIn };
}

async function saveStake(stakeInfo, timeOutMultiplier) {
  try {
    let childData;
    const screeningData = await getChildAndData(stakeInfo, timeOutMultiplier);
    if (stakeInfo.csvType === 'sup') {
      childData = buildOutputData(splitSups(sortList(listAllChildren(screeningData, stakeInfo.csvType))));
    } else {
      childData = buildOutputData(sortList(listAllChildren(screeningData, stakeInfo.csvType)));
    }
    return appendStake(stakeInfo.fileToSave, childData);
  } catch(err) {
    return (stakeInfo);
  }
}

async function saveWomenInfo(stakeInfo, type) {
  const screeningData = await getWomen(stakeInfo);
  const childData = buildOutputData(sortList(listWomen(screeningData)));
  return appendStake(stakeInfo.fileToSave, childData);
}

function oneStakeWomen(parmObj) {
  var newObj = Object.assign({}, parmObj);
  // newObj.stakeDB = parmObj.stakeDB;
  newObj.stakename = 'Current';
  newObj.csvType = 'womenInfo';
  return saveWomenInfo(newObj);
}

function parseJwt (token) {
  return jwt_decode(token);
}

exports.compactDB = function (req, res) {
  var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + req.params.stakeDB);

  stakeDb.compact(req.params.stakeDB, (err, body) => {
    if (err) {
      return res.status(400).send({
        message: err.message
      });
    }
    return res.status(200).send({
      message: `${ req.params.stakeDB } compacted`
    });
  })
};

exports.createCSVFromDB = async function (req, res) {
  function reportCSVComplete(input) {
    let fileToRead = input;
    return res.status(200).send({
      message: input
    });
  }

  function reportAggregateComplete(input, retryCount) {
    const toRetry = input.filter((retVal) => {
      if (typeof retVal !== 'string') {
        return (retVal);
      }
    });
    if (toRetry.length === 0) {
      return res.status(200).send({
        message: input[0]
      });
    }
    console.log(`stakes to retry = ${ toRetry.length }`);
    if (retryCount < 1) {
      return res.status(408).send({
        message: `failed after ${ retryCount } retries`
      })
    }
    const stakeRetryList = [];
    toRetry.forEach((stakeToRetry) => {
      stakeRetryList.push(saveStake(stakeToRetry, 0));
    });
    try {
      Promise.map(stakeRetryList, (stakeToSave) => {
        return (stakeToSave);
      }, {concurrancy: 1})
        .then((results) => {
          setTimeout(reportAggregateComplete, 20000, results, retryCount - 1);
        }).catch((error) => {
        console.log(error.message);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error)
        });
      });
    } catch (err) {
      console.log(err);
    }

  }

  const tokenInfo = parseJwt(req.headers.authorization);
  console.log('inside createCSVfrom DB');
  moment.locale(req.params.language);
  var parmObj = {
    stakeDB: req.params.stakeDB,
    scopeType: req.params.scopeType,
    cCode: req.params.cCode,
    sortField: req.params.sortField,
    language: req.params.language,
    csvType: req.params.csvType,
    fileToSave: `${ req.params.stakeDB }_${tokenInfo.iat}_dbDump.csv`,
  };
  if (parmObj.csvType === 'women') {
    const headerLine = input.language === 'en' ? 'id,firstName,lastName,idGroup,phone,address,city,ward,lds,screenDate,other date\n' :
      'carné de identidad,nombre de pila,apellido,grupo de identificación,teléfono,dirección,ciudad,sala,miembro lds,fecha de la pantalla, otra fecha\n';
    await writeHeader(parmObj.fileToSave, headerLine);
    oneStakeWomen(parmObj)
      .then(reportCSVComplete).catch(function (error) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(error)
      });
    });
  } else {
    parmObj.fileToSave = `sup_list_${ req.params.stakeDB }_${tokenInfo.iat}_dbDump.csv`;
    let headerLine = parmObj.language === 'en' ? '1,2,3,4,5,6,Sup,age,Prior Sup,firstName,lastName,ward,mother,\n' : '1,2,3,4,5,6,Sup,anos,Anterior Sup,nombre de pila,apellido,sala,madre,\n';
    if (parmObj.csvType !== 'sup') {
      parmObj.fileToSave = `${ tokenInfo.iat }_${ req.params.cCode }_${ req.params.csvType }_dbDump.csv`;
      headerLine = 'child Index,stake db name,screen Count,id,gender,firstName,lastName,birthdate,idGroup,mother,father,phone,address,city,ward,lds,screenId,screenDate,weight,height,age,ha,wa,wh,status\n';
    }
    if (parmObj.scopeType === 'countries') {
      parmObj.fileToSave = `${ tokenInfo.iat }_all_data_${ req.params.csvType }_dbDump.csv`;
    }
    await writeHeader(parmObj.fileToSave, headerLine);
    getDBListFromFile(parmObj).map((stakeToSave) => {
      return stakeToSave;
    }, {concurrancy: 1})
      .then((results) => {
        reportAggregateComplete(results, retryLimit)
      }).catch((error) => {
      console.log(error.message);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(error)
      });
    });
  }
};

exports.getSyncURL = function(req, res) {
  console.log('inside getSyncURL');
  return res.json({ entity: process.env.SYNC_ENTITY, url: process.env.COUCH_URL });
};

exports.getCountryList = function(req, res) {
  console.log('inside getCountryLIst');
  request.get('https://' + process.env.COUCH_URL +
      '/country_list/liahona_kids_countries_stakes', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonObj;
      var reasons;
      try {
        jsonObj = JSON.parse(response.body);
        res.json(jsonObj);
      } catch (error) {
        console.log('JSON.parse error');
        reasons.error = 'JSON.parse error';
        reasons.reason = '?';
        return res.status(400).send({
          message: reasons
        });
      }
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
  return (screenObj);
}

function buildScreens(dataBase, childId, screenList) {
  const docEntrys = [];
  screenList.map((screening) => {
    const scrObj = screening.screen;
    if (!scrObj._id) { // if we have the id, use it
      scrObj._id = 'scr_' + '_' + dataBase + '_' + uuid();
      scrObj.owner = childId;
    }
    docEntrys.push(scrObj);
  });
  return docEntrys;
}

function buildChildAndScreens(dataBase, screenList) {
  const docEntry = [];
  const childInfo = screenList[0].child;
  screenList.sort(function (x, y) {
    if (x.surveyDate > y.surveyDate) {
      return -1;
    }
    if (x.surveyDate < y.surveyDate) {
      return 1;
    }
    if (x.surveyDate === y.surveyDate) {
      return 0;
    }
    return 0;
  });
  childInfo.zscoreStatus = calculateStatus(screenList[0].screen).zscoreStatus;
  if (!childInfo.oldId) {
    childInfo._id = 'chld_' + dataBase + '_' + uuid();
  } else {
    childInfo._id = childInfo.oldId;
  }

  const screens = buildScreens(dataBase, childInfo._id, screenList);

  childInfo.lastScreening = screens[0]._id;
  // childInfo.zscoreStatus = calculateStatus(screens[0]).zscoreStatus;
  childInfo.statusColor = statusColor(childInfo.zscoreStatus);
  docEntry.push(childInfo);

  return [...docEntry, ...screens];
}

function calculateStatus(screeningObj) {
  var zscoreStatus = '';
  if (screeningObj.zScore.wl < -2) {
    zscoreStatus = 'Acute: supplements required';
  } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 6 && screeningObj.monthAge < 36) {
    zscoreStatus = 'Acute: supplements required';
  } else if ((screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) && screeningObj.monthAge > 36 && screeningObj.monthAge < 60) {
    zscoreStatus = 'Micro nutrients required';
  } else if (screeningObj.zScore.ha < -1 ||
    screeningObj.zScore.wa < -1 ||
    screeningObj.zScore.wl < -1) {
    zscoreStatus = 'At Risk: Come to next screening';
  } else {
    zscoreStatus = 'Normal';
  }
  return ({screeningObj: screeningObj, zscoreStatus: zscoreStatus});
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

async function buildScreenList(dataBase, input) {
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
  var idIndex = 0;
  var scrIdIndex = 0;

  for (i = 1; i < columnData[0].length; i++) {
    if (~columnData[0][i].toLowerCase().indexOf('firstname')) {
      firstNameIndex = i;
    } else if (columnData[0][i].toLowerCase() === 'id') {
      idIndex = i;
    } else if (columnData[0][i].toLowerCase() === 'scrid') {
      scrIdIndex = i;
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
    } else {
      console.log(columnData[0][i]);
    }
  }

  var dataBaseObj = [];
  var j;
  for (j = 1; j < columnData.length - 1; j++) {
    var childObj = {};
    var screenObj = {zScore: {ha: '', haStatus: '', wa: '', waStatus: '', wl: '', wlStatus: ''}};
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
    if (idIndex !==0) {
      childObj._id = columnData[j][idIndex];
    }

    screenObj.surveyDate = columnData[j][surveyDateIndex];
    screenObj.monthAge = columnData[j][monthAgeIndex];
    screenObj.gender = columnData[j][genderIndex];
    screenObj.weight = columnData[j][weightIndex];
    screenObj.height = columnData[j][heightIndex];
    screenObj.zScore.ha = columnData[j][haIndex];
    screenObj.zScore.wa = columnData[j][waIndex];
    screenObj.zScore.wl = columnData[j][whIndex];
    screenObj.owner = columnData[j][idIndex];
    if (scrIdIndex !== 0) {
      screenObj._id = columnData[j][scrIdIndex];
    }
    screenObj = gradeZScores(screenObj);

    dataBaseObj.push({db: dataBase, child: childObj, screen: screenObj});
  }

  const uniqueChildEntries = _.uniqWith(dataBaseObj, (arrVal, otherVal) => {
    return arrVal.child._id === otherVal.child._id;
  });

  const childAndScreens = [];
  _.forEach(uniqueChildEntries, (uniqueChild, uniqueIndex) => {
    childAndScreens[uniqueIndex] = [];
    _.forEach(dataBaseObj, (child) => {
      if (child.child._id === uniqueChild.child._id) {
        childAndScreens[uniqueIndex].push(child);
      }
    })
  });

  let updatedDocs = [];
  childAndScreens.map((childInfo) => {
    const dbInfo = buildChildAndScreens(dataBase, childInfo);
    updatedDocs = [...updatedDocs, ...dbInfo];
  });

  return updatedDocs;
}

async function bulkUpload(dataBase, docs) {
  return new Promise((resolve, reject) => {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    return stakeDb.bulk({docs: docs}, (err, body) => {
      if (!err) {
        return resolve(body);
      }
      reject(err);
    });
  })
}

exports.uploadCsv = async function (req, res) {
  function returnOk() {
    if (errorStack.length > 0) {
      return (res.status(400).send({ message: errorStack.join() }));
    }
    return (res.status(200).send({ message: 'update complete' }));
  }

  var upload = csvloader(config.uploads.csvUpload).single('newUploadCsv');
  // Filtering to upload only images
  upload.fileFilter = require(path.resolve('./config/lib/csvloader.js')).csvUploadFileFilter;

  upload(req, res, function (uploadError) {
    if (uploadError) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(uploadError)
      });
    } else {
      // parse csv
      parseCsv(res.req.file.path, async (parsedData) => {

        try {
          const bulkData = await buildScreenList(req.params.stakeDB, parsedData);
          await bulkUpload(req.params.stakeDB, bulkData);
          returnOk();
        } catch (error) {
          console.log(error);
          return res.status(400).send({
            message: errorHandler.getErrorMessage(error),
          });
        }
      });
    }
  });
};

exports.jiraWebhook = function(req, res) {
  var event = req;
  return res.status(200).send({});
};

exports.listDbs = function(req, res) {
  request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
      '/_all_dbs', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonObj;
      try {
        jsonObj = JSON.parse(body);
        res.json(jsonObj);
      } catch (error) {
        console.log('error in JSON.parse listDbs');
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error)
        });
      }
    } else {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(error)
      });
    }
  });
};

function getDBListFromFile(parmsIn) {
  return new Promise(function(resolve, reject) {
    request.get('https://' + process.env.COUCH_URL +
      '/country_list/liahona_kids_countries_stakes', function (error, response) {
      if (!error && response.statusCode === 200) {
        var jsonObj;
        let stakes = [];
        let stakeList = [];
        let countryList = [];

        try {
          jsonObj = JSON.parse(response.body);
          countryList = jsonObj.countries;
          if (parmsIn.scopeType === 'stake') {
            let parmObj = Object.assign({}, parmsIn);
            // parmObj.stakeDB = stake.stakeDB;
            // parmObj.stakeName = stake.stakeName;
            stakeList.push(saveStake(parmObj, 0));
            // resolve(stakeList);
          } else if (parmsIn.scopeType === 'country') {
            let country = countryList.filter((country) => {
              return country.code === parmsIn.cCode;
            });
            country[0].stakes.forEach((stake, index) => {
              let parmObj = Object.assign({}, parmsIn);
              parmObj.stakeDB = stake.stakeDB;
              parmObj.stakeName = stake.stakeName;
              stakeList.push(saveStake(parmObj, index));
            })
          } else if (parmsIn.scopeType === 'countries') {
            countryList.forEach((country) => {
              country.stakes.forEach((stake, index) => {
                if (!stake.stakeDB.startsWith('test')) {
                  let parmObj = Object.assign({}, parmsIn);
                  parmObj.stakeDB = stake.stakeDB;
                  parmObj.stakeName = stake.stakeName;
                  stakeList.push(saveStake(parmObj, index));
                }
              });
            });
          }

          resolve(stakeList);
        } catch (err) {
          console.log('JSON.parse error');
          reject('JSON.parse error');
        }
      } else {
        reject();
      }
    });
  });
}
