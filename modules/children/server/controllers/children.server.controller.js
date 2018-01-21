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
        'map': 'function(doc){emit([doc.firstName, doc.lastName], doc)}'
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
  {
    '_id': '_design/screenings_search',
    'views': {
      'find_by_owner': {
        'search': 'function(doc){ if (doc.owner) { emit([doc.owner], doc)}}'
      }
    }
  }
];

function validateView(type, stakeDB, view) {
  return new Promise(function(resolve, reject) {
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
        // console.log('view exists or error');
        resolve(view._id + ' already exists');
      }
    });
  });
}

exports.checkUpdateViews = function (req, res) {
  var toCheck = [];
  viewList.forEach(function (view) {
    toCheck.push(validateView('view', req.params.stakeDB, view));
  });
  filterList.forEach(function (filter) {
    toCheck.push(validateView('filter', req.params.stakeDB, filter));
  });

  var allViews = Promise.all(toCheck);
  allViews.then(function(input) {
    return (res.status(200).send({ message: input }));
  }).catch(function (err) {
    return res.status(400).send({
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  });
};

function getScreeningsList(childId, screeningList) {
  var screenList = [];
  screeningList.forEach(function(screenEntry) {
    if (~screenEntry.key.owner.indexOf(childId)) {
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

function listAllChildren(childScreenList) {
  var count = 0;
  var linesToAdd = [];
  var sortedScreenList = [];
  var noScreenings = 0;

  var supType = 'none';
  var tooOld = 0;
  var timeSinceLastScreen;

  childScreenList.forEach(function (dataSet) {
    if (dataSet[0].data.total_rows > 0) {
      dataSet[0].data.rows.forEach(function (childEntry) {
        var currentAge = moment().diff(moment(new Date(childEntry.key.birthDate)), 'months');
        if (~dataSet[0].parms.filter.indexOf('zscore')) {
          if (currentAge < 60 && ~childEntry.id.indexOf('chld')) {
            sortedScreenList = getScreeningsList(childEntry.id, dataSet[1].data.rows);
            if (sortedScreenList.length === 0) {
              noScreenings++;
              linesToAdd.push(addChildToLine(childEntry.key, sortedScreenList[0], dataSet[0].parms.sortField, dataSet[0].parms.stakeDB, dataSet[0].parms.filter, ' ', 100, dataSet[0].language));
            } else {
              supType = 'none';
              sortedScreenList.forEach(function(screening, index) {
                // if(childEntry.key.firstName.indexOf('Fernanda Ara') > -1) {
                //   console.log('Found it');
                // }
                if ((screening.zScore.ha > -2 && screening.zScore.ha <-1) || (screening.zScore.wa > -2 && screening.zScore.wa < -1)) {
                  supType = 'risk';
                } else if ((screening.zScore.ha < -2 || screening.zScore.wa < -2)) {
                  supType = 'sup';
                  if (currentAge > 36 && currentAge <= 60) {
                    supType = 'mic';
                  }
                  if (screening.zScore.wl < -2) {
                    supType = 'MAM';
                    if (screening.zScore.wl < -3) {
                      supType = 'SAM';
                    }
                  }
                }
              });
              timeSinceLastScreen = moment().diff(moment(new Date(sortedScreenList[0].surveyDate)), 'months');
                linesToAdd.push(addChildToLine(childEntry.key, sortedScreenList[0], dataSet[0].parms.sortField, dataSet[0].parms.stakeDB,
                  dataSet[0].parms.filter, supType, timeSinceLastScreen, dataSet[0].parms.language));
               }
            }
        } else {
          if (dataSet[1].data.total_rows > 0) {
            sortedScreenList = getScreeningsList(childEntry.id, dataSet[1].data.rows);
            sortedScreenList.forEach(function (entry) {
              linesToAdd.push(addLineToStack(childEntry.key, entry, dataSet[0].parms.sortField, dataSet[0].stake, dataSet[0].stakeName, dataSet[0].parms.language));
              count++;
            });
          }
        }
      });
    }
  });
  return linesToAdd;
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

function dbRequest(stake, stakeName, parmObj, view) {
  return new Promise(function(resolve, reject) {
    try {
      var couchURL;
      if (process.env.COUCH_URL.indexOf('localhost') > -1) {
        couchURL = 'http://' + process.env.COUCH_URL + '/';
      } else {
        couchURL = 'https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/';
      }
      var newObj = parmObj;
      request.get(couchURL + stake + '/_design/' + view + '/_view/screen', function (error, response, body) {
        if (!error && response.statusCode === 200) {
          var jsonObj;
          try {
            jsonObj = JSON.parse(body);
            resolve({ stake: stake, stakeName: stakeName, parms: newObj, data: jsonObj, view: view });
          } catch (e) {
            // console.log('Error JSON.Parse dbRequest');
            resolve({ stake: stake, stakeName: stakeName, parms: newObj, data: [], view: view });
          }
        } else {
          if (error) {
            console.log('database error: ' + error.message);
          } else {
            if (response.statusCode === 504) {
              console.log('504 returned accessing ' + stake);
            }
            console.log('status code = ' + response.statusCode);
          }
          resolve({ stake: stake, stakeName: stakeName, parms: newObj, data: [], view: view });
        }
      });
    } catch (e) {
      console.log('error');
      resolve({ stake: stake, stakeName: stakeName, parms: parmObj, data: [], view: view });
    }
  });
}

function getWomen(parmObj) {
  var newObj = parmObj;
  var stake = parmObj.stakeDB;
  return Promise.join(dbRequest(stake, parmObj.stakename, newObj, 'pregnant_women'), dbRequest(stake, parmObj.stakename, newObj, 'nursing_mothers'));
}

function getChildAndData(parmObj) {
  var newObj = parmObj;
  var stake = parmObj.stakeDB;
  return Promise.join(dbRequest(stake, parmObj.stakename, newObj, 'children_list'), dbRequest(stake, parmObj.stakename, newObj, 'scr_list'));
}

function writeBigFile(input) {
  return new Promise(function(resolve, reject) {
    var headerLine;
    if (Object.keys(input).length === 0) {
      reject(new Error('Nothing to display, sync and try again?'));
    }
    headerLine = 'child Index,stake db name,screen Count,id,gender,firstName,lastName,birthdate,idGroup,mother,father,phone,address,city,ward,lds,screenDate,weight,height,age,ha,wa,wh,status\n';
    var outPut = headerLine += input.data;
    fs.writeFile('files/aggregated_list.csv', outPut, function (err) {
      if (err) {
        console.log(err);
        reject(err.message);
      } else {
        resolve('aggregated_list.csv');
      }
    });
  });
}

function writeTheFile(input) {
  return new Promise(function(resolve, reject) {
    var headerLine;
    if (Object.keys(input).length === 0) {
      reject(new Error('Nothing to display, sync and try again?'));
    }
    var currentMonth = moment().month();
    if (~input.filter.indexOf('preg') || ~input.filter.indexOf('nurs')) {
      headerLine = input.language === 'en' ? 'id,firstName,lastName,idGroup,phone,address,city,ward,lds,screenDate,other date\n' :
        'carné de identidad,nombre de pila,apellido,grupo de identificación,teléfono,dirección,ciudad,sala,miembro lds,fecha de la pantalla, otra fecha\n';
    } else if (~input.filter.indexOf('zscore')) {
      var columns = input.language === 'en' ? 'firstName,lastName,ward,birthdate,mother,age,sup type,' : 'nombre de pila,apellido,sala,Fecha de nacimiento,madre,anos,tipo de suplemento,';
      headerLine =  columns + moment.months(currentMonth % 12) + ',' + moment.months((currentMonth + 1) % 12) + ',' + moment.months((currentMonth + 2) % 12) + ',' + moment.months((currentMonth + 3) % 12) + ',' + moment.months((currentMonth + 4) % 12) + ',' + moment.months((currentMonth + 5) % 12) + '\n';
    } else {
      headerLine = 'id,gender,firstName,lastName,birthdate,idGroup,mother,father,phone,address,city,ward,lds,screenDate,weight,height,age,ha,wa,wh,status\n';
    }
    var outPut = headerLine += input.data;
    fs.writeFile('files/' + input.dbId + '.csv', outPut, function (err) {
      if (err) {
        console.log(err);
        reject(err.message);
      } else {
        resolve('files/' + input.dbId + '.csv');
      }
    });
  });
}

function collectAll(dbKids) {
  return new Promise(function(resolve, reject) {
    var writeStack = '';
    var stakeDB;
    var filter;
    var language;
    if (dbKids.listIn.length === 0 && dbKids.missedList.length === 0 && dbKids.riskList.length === 0 && dbKids.normalList.length === 0) {
      console.log('nothing to write');
      resolve({});
    } else {
      if (dbKids.listIn.length > 0) {
        stakeDB = dbKids.listIn[0].stakeDB;
        filter = dbKids.listIn[0].filter;
        language = dbKids.listIn[0].language;
      } else if (dbKids.missedList.length > 0) {
        stakeDB = dbKids.missedList[0].stakeDB;
        filter = dbKids.missedList[0].filter;
        language = dbKids.missedList[0].language;
      } else if (dbKids.riskList.length > 0) {
        stakeDB = dbKids.riskList[0].stakeDB;
        filter = dbKids.riskList[0].filter;
        language = dbKids.riskList[0].language;
      } else if (dbKids.normalList.length > 0) {
        stakeDB = dbKids.normalList[0].stakeDB;
        filter = dbKids.normalList[0].filter;
        language = dbKids.normalList[0].language;
      }
    }
    if (dbKids.listIn.length > 0) {
      dbKids.listIn.forEach(function (kid) {
        writeStack += kid.dataLine;
      });
    }
    if (dbKids.missedList.length > 0) {
      dbKids.missedList.forEach(function (kid) {
        writeStack += kid.dataLine;
      });
    }
    if (dbKids.riskList.length > 0) {
      dbKids.riskList.forEach(function(kid) {
        writeStack += kid.dataLine;
      });
    }
    if (dbKids.possibleProblems.length > 0) {
      dbKids.possibleProblems.forEach(function(prob) {
        writeStack += prob.dataLine;
      });
    }
    if (dbKids.normalList.length > 0) {
      dbKids.normalList.forEach(function(prob) {
        writeStack += prob.dataLine;
      });
    }
    resolve({ data: writeStack, dbId: stakeDB, filter: filter, language: language});
  });
}

function addChildToLine(ownerInfo, screenInfo, sortField, stakeDB, filter, supType, timeSinceLastScreen, language) {
  return new Promise(function (resolve, reject) {
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
    if (supType.indexOf('risk') > -1) {
      var message = language === 'en' ? ' months since last screening, Possible risk, please come to next screening\n' :
        ' meses desde la última evaluación, riesgo posible, venga a la siguiente evaluación\n';
      dataLine = ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward + ',' + moment(new Date(ownerInfo.birthDate)).format('YYYY MM DD') +
        ',' + ownerInfo.mother + ',' + currentAge + ',' + timeSinceLastScreen + message;
      resolve({ data: ownerInfo, dataLine: dataLine, stakeDB: stakeDB, sortField: sortField, filter: filter, atRisk: true, language: language });
    } else if (supType.indexOf('none') > -1) {
      var message = language === 'en' ? ' months since last screening, normal risk, please come to next screening\n' :
        ' meses desde la última evaluación, riesgo normal, venga a la siguiente evaluación\n';
      dataLine = ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward + ',' + moment(new Date(ownerInfo.birthDate)).format('YYYY MM DD') +
        ',' + ownerInfo.mother + ',' + currentAge + ',' + timeSinceLastScreen + message;
      resolve({ data: ownerInfo, dataLine: dataLine, stakeDB: stakeDB, sortField: sortField, filter: filter, normalZscore: true, language: language });
    } else if (screenInfo === undefined || timeSinceLastScreen > 6) {
      if (timeSinceLastScreen === undefined || timeSinceLastScreen === 100) {
        var messageProb = language === 'en' ? ' no screenings: possible duplicate?\n' : ' sin proyecciones: posible duplicado?\n';
        dataLine = ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward + ',' + moment(new Date(ownerInfo.birthDate)).format('YYYY MM DD') +
          ',' + ownerInfo.mother + ',' + currentAge + ',' + messageProb;
      } else {
        var messageRisk = language === 'en' ? '  months since last screening' + ', Child at risk, should come to next screening\n' :
          ' meses desde la última evaluación '+', Niño en riesgo, debería pasar a la siguiente evaluación\n';
        dataLine = ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward + ',' + moment(new Date(ownerInfo.birthDate)).format('YYYY MM DD') +
          ',' + ownerInfo.mother + ',' + currentAge + ',' + timeSinceLastScreen + messageRisk;
      }
      resolve({ data: ownerInfo, dataLine: dataLine, stakeDB: stakeDB, sortField: sortField, filter: filter, missedScreen: true, language: language });
    } else {
      dataLine = ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward + ',' + moment(ownerInfo.birthDate).format('YYYY MM DD') +
        ',' + ownerInfo.mother + ',' + currentAge + ',' + supType + ',[ ]' + ',[ ]' + ',[ ]' + ',[ ]' + ',[ ]' + ',[ ]' + '\n';
      resolve({ data: ownerInfo, dataLine: dataLine, stakeDB: stakeDB, sortField: sortField, filter: filter, language: language });
    }
  });
}

function addLineToStack(ownerInfo, screenInfo, sortField, stakeDB, stakeName, language) {
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
  return { data: dataObj, dataLine: dataLine, stakeDB: stakeDB, stakeName: stakeName, sortField: sortField, filter: 'all' };
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

function numberEm(lists) {
  var idCounter = 0;
  var savedId = 0;
  var screenCounter = 1;
  lists.listIn.forEach(function(child, index) {
    if (child.data.childId === savedId) {
      lists.listIn[index].childIndexId = idCounter;
      lists.listIn[index].screenIndex = ++screenCounter;
    } else {
      screenCounter = 1;
      lists.listIn[index].childIndexId = ++idCounter;
      lists.listIn[index].screenIndex = screenCounter;
      savedId = child.data.childId;
    }
    lists.listIn[index].dataLine = lists.listIn[index].childIndexId + ',' + lists.listIn[index].stakeName + ',' + lists.listIn[index].screenIndex + ',' + lists.listIn[index].dataLine;
  });
  return lists;
}

function sortEm(listIn) {
  var missedList = [];
  var atRiskList = [];
  var possibleProb = [];
  var normalList = [];
  for (var i = listIn.length - 1; i >= 0; i--) {
    if (listIn[i] === undefined) {
      listIn.splice(i, 1);
    } else if (listIn[i].missedScreen) {
      if (listIn[i].dataLine.indexOf('duplicate') > -1) {
        possibleProb.push(listIn[i]);
      } else {
        missedList.push(listIn[i]);
      }
      listIn.splice(i, 1);
    } else if (listIn[i].atRisk) {
      atRiskList.push(listIn[i]);
      listIn.splice(i, 1);
    } else if (listIn[i].normalZscore) {
      normalList.push(listIn[i]);
      listIn.splice(i, 1);
    }
  }
  missedList.forEach(function(entry, index) {
    if (entry.data[entry.sortField] === undefined) {
      missedList[index].data[entry.sortField] = 'unknown';
    }
  });
  atRiskList.forEach(function(entry, index) {
    if (entry.data[entry.sortField] === undefined) {
      atRiskList[index].data[entry.sortField] = 'unknown';
    }
  });
  listIn.forEach(function(entry, index) {
    if (entry.data[entry.sortField] === undefined) {
      listIn[index].data[entry.sortField] = 'unknown';
    }
  });
  normalList.forEach(function(entry, index) {
    if (entry.data[entry.sortField] === undefined) {
      normalList[index].data[entry.sortField] = 'unknown';
    }
  });
  listIn.sort(function(x, y) {
    if (x.data[x.sortField].toUpperCase() < y.data[x.sortField].toUpperCase()) {
      return -1;
    }
    if (x.data[x.sortField].toUpperCase() > y.data[x.sortField].toUpperCase()) {
      return 1;
    }
    if (x.data[x.sortField].toUpperCase() === y.data[x.sortField].toUpperCase()) {
      return 0;
    }
    return 0;
  });
  missedList.sort(function(x, y) {
    if (x.data[x.sortField].toUpperCase() < y.data[x.sortField].toUpperCase()) {
      return -1;
    }
    if (x.data[x.sortField].toUpperCase() > y.data[x.sortField].toUpperCase()) {
      return 1;
    }
    if (x.data[x.sortField].toUpperCase() === y.data[x.sortField].toUpperCase()) {
      return 0;
    }
    return 0;
  });
  atRiskList.sort(function(x, y) {
    if (x.data[x.sortField].toUpperCase() < y.data[x.sortField].toUpperCase()) {
      return -1;
    }
    if (x.data[x.sortField].toUpperCase() > y.data[x.sortField].toUpperCase()) {
      return 1;
    }
    if (x.data[x.sortField].toUpperCase() === y.data[x.sortField].toUpperCase()) {
      return 0;
    }
    return 0;
  });
  normalList.sort(function(x, y) {
    if (x.data[x.sortField].toUpperCase() < y.data[x.sortField].toUpperCase()) {
      return -1;
    }
    if (x.data[x.sortField].toUpperCase() > y.data[x.sortField].toUpperCase()) {
      return 1;
    }
    if (x.data[x.sortField].toUpperCase() === y.data[x.sortField].toUpperCase()) {
      return 0;
    }
    return 0;
  });
  normalList.sort(firstNameSort);
  missedList.sort(firstNameSort);
  atRiskList.sort(firstNameSort);
  possibleProb.sort(firstNameSort);
  return { listIn: listIn, missedList: missedList, riskList: atRiskList, possibleProblems: possibleProb, normalList: normalList};
}

function firstNameSort(x, y) {
  if (x.data.firstName.toUpperCase() < y.data.firstName.toUpperCase()) {
    return -1;
  }
  if (x.data.firstName.toUpperCase() > y.data.firstName.toUpperCase()) {
    return 1;
  }
  if (x.data.firstName.toUpperCase() === y.data.firstName.toUpperCase()) {
    return 0;
  }
  return 0;
}

function dbListToFile(parmObj) {
  return getDBListFromFile(parmObj).map(function(db) {
    var newObj = parmObj;
    newObj.stakeDB = db.db;
    newObj.stakename = db.name;
    return getChildAndData(newObj);
  }, { concurrency: 2 });
}

function oneStake(parmObj) {
  var stakeList = [];
  var newObj = parmObj;
  newObj.stakeDB = parmObj.stakeDB;
  newObj.stakename = 'Current';
  stakeList.push(newObj);
  return Promise.map(stakeList, function(stuff) {
    return Promise.resolve(getChildAndData(stuff));
  }, { concurrency: 2 });
}

function oneStakeWomen(parmObj) {
  var stakeList = [];
  var newObj = parmObj;
  newObj.stakeDB = parmObj.stakeDB;
  newObj.stakename = 'Current';
  newObj.filter = parmObj.filter;
  stakeList.push(newObj);
  return Promise.map(stakeList, function(stuff) {
    return Promise.resolve(getWomen(stuff));
  }, { concurrency: 2 });
}

exports.createCSVFromDB = function (req, res) {
  function reportCSVComplete(input) {
    let fileToRead = input;
    return res.status(200).send({
      message: req.params.stakeDB + '.csv'
    });
  }
  function reportAggregateComplete(input) {
    return res.status(200).send({
      message: input
    });
  }
  moment.locale(req.params.language);
  var parmObj = { stakeDB: req.params.stakeDB, filter: req.params.filter, sortField: req.params.sortField, language: req.params.language };
  if (~parmObj.filter.indexOf('zscore')) {
    oneStake(parmObj)
      .then(listAllChildren).all()
      .then(sortEm)
      .then(collectAll)
      .then(writeTheFile)
      .then(reportCSVComplete).catch(function (err) {
        return res.status(400).send({
          message: err.message,
          name: err.name,
          stack: err.stack
        });
      });
  } else if (~parmObj.filter.indexOf('preg') || ~parmObj.filter.indexOf('nurs')) {
    oneStakeWomen(parmObj)
      .then(listWomen)
      .then(sortEm)
      .then(collectAll)
      .then(writeTheFile)
      .then(reportCSVComplete).catch(function (err) {
        return res.status(400).send({
          message: err.message,
          name: err.name,
          stack: err.stack
        });
      });
  } else {
    dbListToFile(parmObj)
      .then(listAllChildren)
      .then(sortEm)
      .then(numberEm)
      .then(collectAll)
      .then(writeBigFile)
      .then(reportAggregateComplete).catch(function (err) {
        return res.status(400).send({
          message: err.message,
          name: err.name,
          stack: err.stack
        });
      });
  }
};

exports.getSyncURL = function(req, res) {
  return res.json({ entity: process.env.SYNC_ENTITY, url: process.env.COUCH_URL });
};

exports.getCountryList = function(req, res) {
  request.get('https://' + process.env.COUCH_URL +
      '/country_list/liahona_kids_countries_stakes', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonObj;
      var reasons;
      try {
        jsonObj = JSON.parse(response.body);
        res.json(jsonObj);
      } catch (err) {
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

function saveScreening(dataBase, childInfo, screeningInfo) {
  return new Promise(function(resolve, reject) {
    var statusInfo = calculateStatus(screeningInfo);
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    // screeningInfo._id = 'scr_' + childInfo.firstName.replace(' ','_') + '_' + dataBase + '_' + moment();
    screeningInfo._id = 'scr_' + '_' + dataBase + '_' + uuid();
    screeningInfo.owner = childInfo._id;
    stakeDb.insert(screeningInfo, function (err, scrResponse) {
      if (err) {
        console.log(err.message);
        errorStack.push(screeningInfo.owner);
        errorStack.push(err.message);
        resolve(err.message);
//            reject(err);
      } else {
        childInfo.lastScreening = scrResponse.id;
//        childInfo._rev = childInfo._rev;
        childInfo.zscoreStatus = statusInfo.zscoreStatus;
        childInfo.statusColor = statusColor(statusInfo.zscoreStatus);
        resolve(updateChildObject(dataBase, childInfo));
      }
    });
  });
}

function updateChildObject(dataBase, childInfo) {
  return new Promise(function (resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    stakeDb.insert(childInfo, function (err, childResponse) {
      if (err) {
        console.log(err.message);
        errorStack.push('updating ' + childInfo.firstName + ' ' + childInfo.lastName);
        errorStack.push(err.message);
        resolve(err.message);
//      reject(err);
      } else {
        if (childResponse.ok) {
          resolve('update complete');
        } else {
          console.log(err.message);
          errorStack.push(childInfo.firstName + ' ' + childInfo.lastName);
          errorStack.push(err.message);
          resolve(err.message);
        }
      }
    });
  });
}

function saveTheObjects(dataBase, childInfo, screeningInfo) {
  return new Promise(function (resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
 //   childInfo._id = 'chld_' + childInfo.firstName.replace(' ','_') + '_' + dataBase + '_' + moment ();
    childInfo._id = 'chld_' + dataBase + '_' + uuid();
    stakeDb.insert(childInfo, function (err, childResponse) {
      if (err) {
        console.log(err.message);
        errorStack.push(childInfo.firstName + ' ' + childInfo.lastName);
        errorStack.push(err.message);
        resolve(err.message);
//      reject(err);
      } else {
        if (childResponse.ok) {
          var childObj = {};
          childObj = childInfo;
          childObj._rev = childResponse.rev;
         // existingChildren.push (childObj);
          resolve(isScreeningDuplicate(dataBase, childObj, screeningInfo));
        } else {
          console.log(err.message);
          errorStack.push(childInfo.firstName + ' ' + childInfo.lastName);
          errorStack.push(err.message);
          resolve(err.message);
        }
      }
    });
  });
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

function childInDatabase(dataBase, childInfo, screeningInfo) {
  return new Promise(function (resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    stakeDb.view('name_search', 'find_by_name', { key: [childInfo.firstName, childInfo.lastName], include_docs: true }, function(error, response) {
      if (!error) {
        if (response.rows.length === 0) {
          resolve(saveTheObjects(dataBase, childInfo, screeningInfo));
        } else {
          childInfo = response.rows[0].doc;
          resolve(isScreeningDuplicate(dataBase, childInfo, screeningInfo));
        }
      } else {
        var msg = '';
        var myError = new Error({ name: '', errors: [], message: '' });
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

function isScreeningDuplicate(dataBase, childInfo, screeningInfo) {
  return new Promise(function (resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + dataBase);
    stakeDb.view('screen_search', 'find_by_owner', { key: [childInfo._id, screeningInfo.surveyDate], include_docs: true }, function(error, response) {
      if (!error) {
        if (response.rows.length === 0) {
          resolve(saveScreening(dataBase, childInfo, screeningInfo));
        } else {
          childInfo = response.rows[0].doc;
          resolve('duplicate screening, not added');
        }
      } else {
        var msg = '';
        var myError = new Error({ name: '', errors: [], message: '' });
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
      } else {
        console.log(columnData[0][i]);
      }
    }

    var dataBaseObj = [];
    var j;
    for (j = 1; j < columnData.length - 1; j++) {
      var childObj = {};
      var screenObj = { zScore: { ha:'', haStatus:'', wa:'', waStatus:'', wl:'', wlStatus:'' } };
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
      dataBaseObj.push(childInDatabase(dataBase, childObj, gradeZScores(screenObj)));
    }
    resolve(dataBaseObj).each();
  });
}

exports.uploadCsv = function (req, res) {
  function returnOk() {
    if (errorStack.length > 0) {
      return (res.status(400).send({ message: errorStack.join() }));
    }
    return (res.status(200).send({ message: 'update complete' }));
  }

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
      parseCsv(res.req.file.path, function (parsedData) {
        buildObject(req.params.stakeDB, parsedData)
          .all().then(returnOk).catch(function (err) {
            return res.status(400).send({
              message: err.message,
              name: err.name,
              stack: err.stack
            });
          });
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
      } catch (err) {
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
      '/country_list/liahona_kids_countries_stakes', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj;
        var stakeList = [];
        try {
          jsonObj = JSON.parse(response.body);
          jsonObj.countries.forEach(function(country) {
            country.stakes.forEach(function(stake) {
              if (!stake.stakeDB.startsWith('test') && (parmsIn.filter.toUpperCase().indexOf(country.code) > -1 || parmsIn.filter.indexOf('listall') > -1)) {
                stakeList.push({ name: stake.stakeName, db: stake.stakeDB });
              }
            });
          });
          resolve(stakeList);
        } catch (err) {
          console.log('JSON.parse error');
          reject('JSON.parse error');
        }
      } else {
        reject(error.message);
      }
    });
  });
}

function getDBList() {
  return new Promise(function(resolve, reject) {
    request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
      '/_all_dbs', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj;
        try {
          jsonObj = JSON.parse(body);
        } catch (e) {
          reject('Error in JSON.parse getDBList');
        }
        resolve(jsonObj);
      } else {
        reject(errorHandler.getErrorMessage(error));
      }
    });
  });
}
