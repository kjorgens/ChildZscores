"use strict";

/**
 * Module dependencies.
 */
var path = require("path"),
  jwt_decode = require("jwt-decode"),
  request = require("request"),
  fs = require("fs"),
  // stream = require('stream'),
  io = require("socket.io-client"),
  csvParse = require("papaparse"),
  moment = require("moment"),
  uuid = require("uuid4"),
  csvloader = require("multer"),
  config = require(path.resolve("./config/config")),
  Promise = require("bluebird"),
  _ = require("lodash"),
  nano = require("nano"),
  // streamBuffers = require('stream-buffers'),
  errorHandler = require(path.resolve(
    "./modules/core/server/controllers/errors.server.controller"
  ));
// AWS = require('aws-sdk');

// AWS.config.update({ region: 'us-east-1' });

// const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

var retryLimit = 5;

var errorStack = [];

var obesityGirls = [
  15.5, 17.0, 18.4, 19.0, 19.4, 19.6, 19.6, 19.6, 19.6, 19.4, 19.3, 19.1, 19.0,
  18.8, 18.7, 18.6, 18.4, 18.3, 18.2, 18.1, 18.1, 18.0, 17.9, 17.9, 17.8, 18.1,
  18.1, 18.0, 18.0, 18.0, 17.9, 17.9, 17.9, 17.9, 17.9, 17.8, 17.8, 17.8, 17.8,
  17.8, 17.8, 17.8, 17.8, 17.8, 17.8, 17.8, 17.8, 17.9, 17.9, 17.9, 17.9, 17.9,
  17.9, 17.9, 18.0, 18.0, 18.0, 18.0, 18.0, 18.1, 18.1,
];

var obesityBoys = [
  15.8, 17.3, 18.8, 19.4, 19.7, 19.8, 19.9, 19.9, 19.8, 19.7, 19.5, 19.4, 19.2,
  19.1, 18.9, 18.8, 18.7, 18.6, 18.5, 18.4, 18.3, 18.2, 18.1, 18.0, 18.0, 18.3,
  18.2, 18.2, 18.1, 18.1, 18.0, 18.0, 18.0, 17.9, 17.9, 17.9, 17.8, 17.8, 17.8,
  17.7, 17.7, 17.7, 17.7, 17.7, 17.7, 17.6, 17.6, 17.6, 17.6, 17.6, 17.6, 17.6,
  17.6, 17.6, 17.6, 17.6, 17.6, 17.6, 17.6, 17.7, 17.7,
];

var coordinatingCounsels = [
  {
    name: "Guatemala Antigua Area Coordinating Council",
    stakes: ["Patzicia Stake", "Sololá District"],
  },
  {
    name: "Guatemala Central Area Coordinating Council",
    stakes: ["Escuintla Stake"],
  },
  {
    name: "Guatemala City Guatemala Area Coordinating Council",
    stakes: ["Cuilapa District"],
  },
  {
    name: "Guatemala Coban Area Coordinating Council",
    stakes: [
      "Chulac District",
      "Cobán Stake",
      "Senahu",
      "Sacsuha District",
      "Salama District",
    ],
  },
  {
    name: "Guatemala East Area Coordinating Council",
    stakes: ["Motagua District", "Jalapa Stake", "Puerto Barrios District"],
  },
  {
    name: "Guatemala Quetzaltenango Area Coordinating Council",
    stakes: [
      "Totonicapán Stake",
      "Quetzaltenango Cantel",
      "Quetzaltenango el Bosque Stake",
      "Quetzaltenango Oeste Stake",
      "Quiche District",
      "Huehuetenango Zaculeu Stake",
      "Huehuetenango Calvario Stake",
      "Huehuetenango Centro Stake",
      "Momostenango Paxajtup District",
      "Momostenango Stake",
      "Momostenango West District",
    ],
  },
  {
    name: "Guatemala Retalhuleu Area Coordinating Council",
    stakes: [
      "Rio Blanco District",
      "Serchil District",
      "Malacatan Stake",
      "Malacatan 2 Stake",
      "Retalhuleu Stake",
      "San Felipe Stake",
      "Coatepeque",
      "Mazatenango",
      "San Pedro",
    ],
  },
  {
    name: "Honduras Comayaguela Area Coordinating Council",
    stakes: ["Juticalpa District"],
  },
  {
    name: "Honduras San Pedro Sula East Area Coordinating Council",
    stakes: [
      "El Progreso Stake",
      "La Ceiba Stake",
      "Miramar",
    ],
  },
  {
    name: "Honduras San Pedro Sula West Area Coordinating Council",
    stakes: [
      "El Merendón Stake",
      "Fesitran Stake",
      "Potrerillos Stake",  
    ],
  },
  {
    name: "Honduras Tegucigalpa Area Coordinating Council",
    stakes: [
      "Choluteca El Porvenir Stake",
      "Choluteca Stake",
      "Danli Stake",
      "Monjaras District",
      "Valle Verde (San Francisco) District",
    ],
  },
];

var filterList = [
  {
    _id: "_design/filter_ddocs",
    filters: {
      ddocs:
        "function(doc, req) {if(doc._id[0] != '_') {return true} else {return false}  }",
    },
  },
];

var viewList = [
  {
    _id: "_design/children_list",
    views: {
      screen: {
        map: "function(doc){if(doc.zscoreStatus && !doc.deliveryDate && !doc.childsBirthDate){emit(doc)}}",
      },
    },
  },
  {
    _id: "_design/name_search",
    views: {
      find_by_name: {
        map: "function(doc){emit([doc.firstName, doc.lastName, doc.birthDate], doc)}",
      },
    },
  },
  {
    _id: "_design/scr_list",
    views: {
      screen: {
        map: "function(doc){if(doc.owner){emit(doc)}}",
      },
    },
  },
  {
    _id: "_design/screen_search",
    views: {
      find_by_owner: {
        map: "function(doc){emit([doc.owner, doc.surveyDate], doc)}",
      },
    },
  },
  {
    _id: "_design/zscore_kids",
    views: {
      screen: {
        map: "function(doc){if(doc.zScore.ha < -2 || doc.zScore.wa < -2 || doc.zScore.wl < -2){emit(doc)}}",
      },
    },
  },
  {
    _id: "_design/pregnant_women",
    views: {
      screen: {
        map: "function(doc){if(doc.deliveryDate){emit(doc)}}",
      },
    },
  },
  {
    _id: "_design/nursing_mothers",
    views: {
      screen: {
        map: "function(doc){if(doc.childsBirthDate){emit(doc)}}",
      },
    },
  },
  {
    _id: "_design/scr_owner_search",
    views: {
      find_by_owner: {
        map: "function(doc){emit(doc.owner, doc)}",
      },
    },
  },
];

var removeFilterList = [
  {
    _id: "_design/screenings_search",
  },
];

// async function uploadReadableStream(stream, s3Key) {
//   const params = { Bucket: process.env.CSV_BUCKET, Key: s3Key, Body: stream };
//   return s3.upload(params).promise();
// }
//
// async function uploadToS3(streamIn, s3Key) {
//   const results = await uploadReadableStream(streamIn, s3Key);
//   console.log('upload complete', results);
// }

function calcObesity(latestScreen) {
  var bmi = latestScreen.weight / Math.pow(latestScreen.height / 100, 2);
  var tableBMI =
    latestScreen.gender === "Girl"
      ? obesityGirls[Math.round(latestScreen.monthAge)]
      : obesityBoys[Math.round(latestScreen.monthAge)];
  return { obese: bmi > tableBMI, currentBMI: bmi };
}

async function updateScreen(screenObj, stakeDB) {
  var stakeDb = nano(
    "https://" +
      process.env.SYNC_ENTITY +
      "@" +
      process.env.COUCH_URL +
      "/" +
      stakeDB
  );
  return stakeDb.insert(screenObj, screenObj);
}

function validateView(type, stakeDB, view) {
  return new Promise(function (resolve, reject) {
    var stakeDb = nano(
      "https://" +
        process.env.SYNC_ENTITY +
        "@" +
        process.env.COUCH_URL +
        "/" +
        stakeDB
    );
    var viewObject;
    if (~type.indexOf("view")) {
      viewObject = { _id: view._id, views: view.views };
    }
    if (~type.indexOf("filter")) {
      viewObject = { _id: view._id, filters: view.filters };
    }
    stakeDb.get(view._id, function (err, body) {
      if (err) {
        stakeDb.insert(viewObject, function (err, response) {
          if (err) {
            var msg = "";
            var updateError = new Error(err.message);
            console.log(err.message);
            reject(updateError);
          } else {
            console.log("view " + view._id + " created in " + stakeDB);
            resolve("view " + view._id + " created in " + stakeDB);
          }
        });
      } else {
        viewObject._rev = body._rev;
        stakeDb.insert(viewObject, function (err, response) {
          if (err) {
            var updateError = new Error(err.message);
            console.log(err.message);
            reject(updateError);
          } else {
            console.log("view " + view._id + " created in " + stakeDB);
            resolve("view " + view._id + " created in " + stakeDB);
          }
        });
        resolve(view._id + " updated");
      }
    });
  });
}

function removeView(type, stakeDB, view) {
  return new Promise(function (resolve, reject) {
    var stakeDb = nano(
      "https://" +
        process.env.SYNC_ENTITY +
        "@" +
        process.env.COUCH_URL +
        "/" +
        stakeDB
    );

    stakeDb.get(view._id, function (err, body) {
      if (!err) {
        stakeDb.destroy(view._id, body.doc.rev, function (err, response) {
          if (err) {
            var updateError = new Error(err.message);
            console.log(err.message);
            reject(updateError);
          } else {
            console.log("view " + view._id + " destroyed " + stakeDB);
            resolve("view " + view._id + " destroyed in " + stakeDB);
          }
        });
      }
      resolve("no view to remove");
    });
  });
}

exports.checkUpdateViews = function (req, res) {
  var toCheck = [];
  viewList.forEach(function (view) {
    toCheck.push(validateView("view", req.params.stakeDB, view));
  });
  filterList.forEach(function (filter) {
    toCheck.push(validateView("filter", req.params.stakeDB, filter));
  });
  removeFilterList.forEach(function (filter) {
    toCheck.push(removeView("remove", req.params.stakeDB, filter));
  });

  var allViews = Promise.all(toCheck);
  allViews
    .then(function (input) {
      return res.status(200).send({ message: input });
    })
    .catch(function (error) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(error),
      });
    });
};

function getScreeningsList(childId, screeningList) {
  var screenList = [];
  screeningList.forEach(function (screenEntry) {
    if (screenEntry.key.owner === childId) {
      screenList.push(screenEntry.key);
    }
  });
  if (screenList.length === 0) {
    // console.log('no screens for ' + childId);
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
  const supList = childScreenList.listIn.filter(
    (child) =>
      child.data.sup !== "none" &&
      child.data.sup !== "risk" &&
      child.data.sinceLastScreen <= 6
  );
  const others = childScreenList.listIn.filter(
    (child) =>
      child.data.sup === "none" ||
      child.data.sup === "risk" ||
      child.data.sinceLastScreen > 6
  );
  return { listIn: [...supList, ...others] };
}

function updateChildStatus(child, stakeDB) {
  return new Promise(() => {
    var stakeDb = nano(
      "https://" +
        process.env.SYNC_ENTITY +
        "@" +
        process.env.COUCH_URL +
        "/" +
        stakeDB
    );
    child.key.supType = child.supType;
    child.key.zscoreStatus = child.zscoreStatus;
    child.key.statusColor = child.statusColor;
    child.key.bmi = child.bmi;
    child.key.obese = child.obese;
    return stakeDb
      .insert(child.key, child.key._id)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

function bulkUpdate(list, dataBase) {
  return new Promise((resolve, reject) => {
    var stakeDb = nano(
      "https://" +
        process.env.SYNC_ENTITY +
        "@" +
        process.env.COUCH_URL +
        "/" +
        dataBase
    );
    return stakeDb.bulk({ docs: list }, (err, body) => {
      if (!err) {
        return resolve(body);
      }
      return reject(err);
    });
  });
}

async function updateSupplementStatus(childList, stakeDB) {
  var noScreenings = 0;
  var sortedScreenList = [];
  var updateList = [];
  if (childList[0].data.total_rows > 0) {
    childList[0].data.rows.forEach(function (childEntry) {
      var currentAge = moment().diff(
        moment(new Date(childEntry.key.birthDate)),
        "months"
      );
      if (!~childEntry.id.indexOf("mthr")) {
        if (currentAge < 60 && ~childEntry.id.indexOf("chld")) {
          sortedScreenList = getScreeningsList(
            childEntry.id,
            childList[1].data.rows
          );
          if (sortedScreenList.length === 0) {
            noScreenings += 1;
            childEntry.noScreenings = true;
          } else {
            var supType = "none";
            var currentSupType = "none";
            var priorMalnurished = "no";

            sortedScreenList.forEach(function (screening, index) {
              if (screening.zScore.ha < -2 || screening.zScore.wa < -2) {
                priorMalnurished = "yes";
                if (currentAge < 24) {
                  supType = "<2";
                }
                if (currentAge < 36) {
                  supType = "sup";
                }
              }

              if (screening.zScore.wl < -2) {
                priorMalnurished = "yes";
                supType = "MAM";
                if (screening.zScore.wl < -3) {
                  supType = "SAM";
                }
              }
              if (index === 0) {
                currentSupType = supType;
              }
            });
            let timeSinceLastScreen = moment().diff(
              moment(new Date(sortedScreenList[0].surveyDate)),
              "months"
            );
            if (timeSinceLastScreen > 7) {
              currentSupType = "none";
            }
            childEntry.supType = currentSupType;
            // if (childEntry.key.firstName === 'ARNOLL MOSIAH') {
            //   childEntry.zscoreStatus = calculateStatus(sortedScreenList[0]).zscoreStatus;
            //   console.log('stop');
            // }
            const bmiInfo = calcObesity(sortedScreenList[0]);
            let newChildData = childEntry.key;
            newChildData.bmi = bmiInfo.currentBMI;
            newChildData.obese = bmiInfo.obese;
            newChildData.zscoreStatus = calculateStatus(
              sortedScreenList[0]
            ).zscoreStatus;
            newChildData.statusColor = statusColor(newChildData.zscoreStatus);
            if (childEntry.supType !== "none") {
              updateList.push(newChildData);
            }
            // updateList.push(updateChildStatus(childEntry, stakeDB));
          }
        }
      }
    });
  }

  return bulkUpdate(updateList, stakeDB);
}

function findDiff(latest, secondToLastest, diffs) {
  var wl = Math.abs(latest.wl - secondToLastest.wl);
  var ha = Math.abs(latest.ha - secondToLastest.ha);
  if (latest.wl > secondToLastest.wl) {
    wl = wl;
  } else {
    wl = wl * -1;
  }

  if (latest.ha > secondToLastest.ha) {
    ha = ha;
  } else {
    ha = ha * -1;
  }

  diffs = {
    wl: wl,
    ha: ha,
  };

  return diffs;
}

function getCoordArea(inputStakeName) {
  var list = coordinatingCounsels;
  var stakeCoordArea;
  list.forEach((area) => {
    var stakesList = area.stakes;
    stakesList.forEach((stakeName) => {
      if (stakeName === inputStakeName) {
        stakeCoordArea = area.name;
      }
    });
  });
  return stakeCoordArea;
}

function summaryReport(sortedScreenList, currentAge, stakeName) {
  var scores;
  var beforeScreening;
  var childStatus;
  var childProgress;
  var diffs = {};
  var summaryAddOns = {};
  var age = currentAge;
  var stakeName = stakeName;
  var coordCounselName = getCoordArea(stakeName);

  if (sortedScreenList[0] != null) {
    scores = sortedScreenList[0].zScore;
  }
  if (sortedScreenList[1] != null) {
    beforeScreening = sortedScreenList[1].zScore;
    diffs = findDiff(scores, beforeScreening, diffs);
  }

  //first step
  if (scores != null) {
    if (scores.wl < -3) {
      childStatus = "SAM";
    } else if (scores.wl < -2 && scores.wl > -3) {
      childStatus = "MAM";
    } else if (scores.ha < -2) {
      childStatus = "Chronic";
    } else if (
      (scores.wl > -2 && scores.wl < -1) ||
      (scores.ha > -2 && scores.ha < -1)
    ) {
      childStatus = "Risk";
    } else {
      childStatus = "Normal";
    }

    //second step
    if (age > 60) {
      childProgress = "Graduated";
    } else if (beforeScreening != null) {
      if (scores.wl < -2 && diffs.wl < -0.1) {
        childProgress = "worse";
      } else if (scores.wl < -2 && diffs.wl > -0.1 && diffs.wl < 0.1) {
        childProgress = "same";
      } else if (scores.wl < -2 && diffs.wl > 0.1) {
        childProgress = "improved";
      } else {
        childProgress = "N/A";
      }
      // //third step
      if (childStatus === "Chronic") {
        if (scores.wa < -2 && beforeScreening.wl < -2) {
          childProgress = "improved";
        } else if (scores.ha < -2 && diffs.ha < -0.1) {
          childProgress = "worse";
        } else if (scores.ha < -2 && diffs.ha > -0.1 && diffs.ha < 0.1) {
          childProgress = "same";
        } else if (scores.ha < -2 && diffs.ha > 0.1) {
          childProgress = "improved";
        } else {
          childProgress = "N/A";
        }
      }
    } else {
      childProgress = "Only One Screeening";
    }
  } else {
    childProgress = "No Screenings";
    childStatus = "No Screenings";
  }

  // //fourth step
  if (beforeScreening != null && childProgress === null) {
    if (beforeScreening.wl < -2 || beforeScreening.ha < -2) {
      childProgress = "recovered";
    } else {
      childProgress = "no change";
    }
  }

  summaryAddOns = {
    childStatus: childStatus,
    childProgress: childProgress,
    currentAge: currentAge,
    coordinatingArea: coordCounselName,
  };

  return summaryAddOns;
}

function listAllChildren(childScreenList, screenType, cCode) {
  var childCount = 0;
  var sortedScreenList = [];
  var noScreenings = 0;
  var supType = "none";
  var currentSupType = "none";
  var timeSinceLastScreen;
  var priorMalnurished = "no";
  var lineAccumulator = [];
  var summaryAddOns = [];
  var monthSelect = parseInt(childScreenList[0].parms.monthSelect);
  var addedChild = 0;

  if (childScreenList[0].data.total_rows > 0) {
    childScreenList[0].data.rows.forEach(async (childEntry, childIndex) => {
      var currentAge = moment().diff(
        moment(new Date(childEntry.key.birthDate)),
        "months"
      );
      if (!~childEntry.id.indexOf("mthr")) {
        if (screenType === "summary") {
          var sortedScreenList = getScreeningsList(
            childEntry.id,
            childScreenList[1].data.rows
          );

          var familyHealthPlan = sortedScreenList[0].familyHealthPlan;
          var followFamilyHealthPlan =
            sortedScreenList[0].followFamilyHealthPlan;
          var visitedDoctor = sortedScreenList[0].visitedDoctor;

          var diffTime = moment().diff(
            moment(new Date(sortedScreenList[0].surveyDate)),
            "months"
          );

          if (monthSelect >= diffTime) {
            summaryAddOns = summaryReport(
              sortedScreenList, 
              currentAge,
              childScreenList[0].parms.stakeName
            );
            lineAccumulator.push(
              addSummaryLineToStack(
                screenType,
                sortedScreenList[0],
                childEntry.key,
                childScreenList[0].parms.sortField,
                childScreenList[0].stake,
                childScreenList[0].parms.stakeName,
                childScreenList[0].parms.language,
                childScreenList[0].parms.cCode,
                summaryAddOns,
                familyHealthPlan,
                followFamilyHealthPlan,
                visitedDoctor
              )
            );
          }
        } else if (screenType === "missedScreening") {
          if (currentAge < 60 && ~childEntry.id.indexOf("chld")) {
           var sortedScreenList = getScreeningsList(
             childEntry.id,
             childScreenList[1].data.rows
           );
           timeSinceLastScreen = moment().diff(
             moment(new Date(sortedScreenList[0].surveyDate)),
             "months"
           );
           if (timeSinceLastScreen > 6 && timeSinceLastScreen < 13) {
            //let stuff = {};
            summaryAddOns = summaryReport(sortedScreenList, currentAge, childScreenList[0].parms.stakeName);
            //console.log(summaryAddOns);
            if (currentAge >= 24 && (summaryAddOns.childStatus === 'SAM' || summaryAddOns.childStatus === 'MAM')) {
              lineAccumulator.push(
                addChildToLine(
                 screenType,
                 childEntry.key,
                 sortedScreenList[0],
                 childScreenList[0].parms.sortField,
                 childScreenList[0].parms.stakeDB,
                 childScreenList[0].parms.filter,
                 currentSupType,
                 timeSinceLastScreen,
                 priorMalnurished,
                 childScreenList[0].parms.language,
                 childScreenList[0].parms.cCode,
                 childScreenList[0].parms.stakeName
               )
             );
            } else if ((currentAge >= 6 && currentAge <= 24) && (summaryAddOns.childStatus === 'SAM' || summaryAddOns.childStatus === 'MAM' || summaryAddOns.childStatus === 'Chronic')) {
              lineAccumulator.push(
                addChildToLine(
                 screenType,
                 childEntry.key,
                 sortedScreenList[0],
                 childScreenList[0].parms.sortField,
                 childScreenList[0].parms.stakeDB,
                 childScreenList[0].parms.filter,
                 currentSupType,
                 timeSinceLastScreen,
                 priorMalnurished,
                 childScreenList[0].parms.language,
                 childScreenList[0].parms.cCode,
                 childScreenList[0].parms.stakeName
               )
             );
            }
          }
         }
        } else if (screenType === "sup") {
          if (currentAge < 60 && ~childEntry.id.indexOf("chld")) {
            // if (childEntry.key.firstName === 'HAILIE YHAL') {
            //   childEntry.zscoreStatus = calculateStatus(sortedScreenList[0]).zscoreStatus;
            //   console.log('stop');
            // }
            // if (childEntry.key.firstName === '') {
            //   childEntry.zscoreStatus = calculateStatus(sortedScreenList[0]).zscoreStatus;
            //   console.log('stop');
            // }
            sortedScreenList = getScreeningsList(
              childEntry.id,
              childScreenList[1].data.rows
            );
            timeSinceLastScreen = moment().diff(
              moment(new Date(sortedScreenList[0].surveyDate)),
              "months"
            );
            if (sortedScreenList.length === 0) {
              noScreenings + 1;
              if (screenType === "sup") {
                lineAccumulator.push(
                  addChildToLine(
                    screenType,
                    childEntry.key,
                    sortedScreenList[0],
                    childScreenList[0].parms.sortField,
                    childScreenList[0].parms.stakeDB,
                    childScreenList[0].parms.filter,
                    " ",
                    100,
                    "no",
                    childScreenList[0].language,
                    childScreenList[0].parms.stakeName,
                    childScreenList[0].parms.cCode
                  )
                );
                addedChild += 1;
              }
            } else {
              supType = "none";
              priorMalnurished = "no";
              currentSupType = "none";
              sortedScreenList.forEach(async (screening, screenIndex) => {
                if (screening.zScore.wa < -2) {
                  priorMalnurished = "yes";
                  if (currentAge < 24) {
                    supType = "MAM";
                  }
                }

                if (screening.zScore.ha < -2) {
                  priorMalnurished = "yes";
                  if (currentAge < 24) {
                    supType = "MAM";
                  }
                }

                if (screening.zScore.wl < -2) {
                  priorMalnurished = "yes";
                  supType = "MAM";
                  if (screening.zScore.wl < -3) {
                    supType = "SAM";
                  }
                }
                if (screenIndex === 0 || currentAge < 24) {
                  if (sortedScreenList.length === 1) {
                    priorMalnurished = "no";
                  }
                  currentSupType = supType;
                }
              });

              if (priorMalnurished && currentAge <= 24) {
                currentSupType = supType;
                if (
                  (supType === "MAM" || supType === "SAM") &&
                  sortedScreenList[0].zScore.wl > -2
                ) {
                  currentSupType = "sup";
                }
                if (
                  (supType === "MAM" || supType === "SAM") &&
                  sortedScreenList[0].zScore.wl < -2
                ) {
                  currentSupType = "MAM";
                  if (sortedScreenList[0].zScore.wl < -3) {
                    currentSupType = "SAM";
                  }
                }
              }

              timeSinceLastScreen = moment().diff(
                moment(new Date(sortedScreenList[0].surveyDate)),
                "months"
              );
              if (
                screenType === "sup" &&
                timeSinceLastScreen < 8 &&
                (currentSupType === "MAM" ||
                  currentSupType === "SAM" ||
                  currentSupType === "sup")
              ) {
                lineAccumulator.push(
                  addChildToLine(
                    screenType,
                    childEntry.key,
                    sortedScreenList[0],
                    childScreenList[0].parms.sortField,
                    childScreenList[0].parms.stakeDB,
                    childScreenList[0].parms.filter,
                    currentSupType,
                    timeSinceLastScreen,
                    priorMalnurished,
                    childScreenList[0].parms.language,
                    childScreenList[0].parms.cCode,
                    childScreenList[0].parms.stakeName
                  )
                );
                addedChild += 1;
              }
            }
          }
          if (
            cCode === "GTM" ||
            cCode === "SLV" ||
            cCode === "HND" ||
            cCode === "NIC"
          ) {
            if (currentAge < 60 && addedChild === 0) {
              sortedScreenList = getScreeningsList(
                childEntry.id,
                childScreenList[1].data.rows
              );
              if (
                currentAge < 36 &&
                currentAge >= 24 &&
                ~childEntry.id.indexOf("chld") &&
                (sortedScreenList[0].zScore.ha < -2 ||
                  sortedScreenList[0].zScore.wa < -2) 
              ) {
                currentSupType = 'sup';
                timeSinceLastScreen = moment().diff(
                  moment(new Date(sortedScreenList[0].surveyDate)),
                  "months"
                );
                lineAccumulator.push(
                  addChildToLine(
                    screenType,
                    childEntry.key,
                    sortedScreenList[0],
                    childScreenList[0].parms.sortField,
                    childScreenList[0].parms.stakeDB,
                    childScreenList[0].parms.filter,
                    currentSupType,
                    timeSinceLastScreen,
                    priorMalnurished,
                    childScreenList[0].parms.language,
                    childScreenList[0].parms.cCode,
                    childScreenList[0].parms.stakeName
                  )
                );
              } else if (
                currentAge < 60 &&
                currentAge >= 36 &&
                ~childEntry.id.indexOf("chld") &&
                (sortedScreenList[0].zScore.ha < -2 ||
                  sortedScreenList[0].zScore.wa < -2) &&
                sortedScreenList[0].zScore.wl > -2
              ) {
                currentSupType = 'SUP';
                timeSinceLastScreen = moment().diff(
                  moment(new Date(sortedScreenList[0].surveyDate)),
                  "months"
                );
                lineAccumulator.push(
                  addChildToLine(
                    screenType,
                    childEntry.key,
                    sortedScreenList[0],
                    childScreenList[0].parms.sortField,
                    childScreenList[0].parms.stakeDB,
                    childScreenList[0].parms.filter,
                    currentSupType,
                    timeSinceLastScreen,
                    priorMalnurished,
                    childScreenList[0].parms.language,
                    childScreenList[0].parms.cCode,
                    childScreenList[0].parms.stakeName
                  )
                );
              } else if (
                (sortedScreenList[0].zScore.wl > -2 &&
                  sortedScreenList[0].zScore.wl < -1) ||
                (sortedScreenList[0].zScore.ha > -2 &&
                  sortedScreenList[0].zScore.ha < -1)
              ) {
                currentSupType = 'riesgo';
                timeSinceLastScreen = moment().diff(
                  moment(new Date(sortedScreenList[0].surveyDate)),
                  "months"
                );
                lineAccumulator.push(
                  addChildToLine(
                    screenType,
                    childEntry.key,
                    sortedScreenList[0],
                    childScreenList[0].parms.sortField,
                    childScreenList[0].parms.stakeDB,
                    childScreenList[0].parms.filter,
                    currentSupType,
                    timeSinceLastScreen,
                    priorMalnurished,
                    childScreenList[0].parms.language,
                    childScreenList[0].parms.cCode,
                    childScreenList[0].parms.stakeName
                  )
                );
              }
            }
          }
          addedChild = 0;
        } else if (screenType === "all") {
          try {
            if (childScreenList[1].data.total_rows > 0) {
              sortedScreenList = getScreeningsList(
                childEntry.id,
                childScreenList[1].data.rows
              );
              sortedScreenList.forEach(async (entry, screenIndex) => {
                lineAccumulator.push(
                  addLineToStack(
                    childIndex + 1,
                    screenIndex + 1,
                    childEntry.key,
                    entry,
                    childScreenList[0].parms.sortField,
                    childScreenList[0].stake,
                    childScreenList[0].parms.stakeName,
                    childScreenList[0].parms.language,
                    childScreenList[0].parms.cCode,
                    entry.muac,
                    entry.familyHealthPlan,
                    entry.followFamilyHealthPlan,
                    entry.visitedDoctor
                  )
                );
              });
            }
          } catch (err) {
            console.log(err.message);
          }
        } 
      } else {
        try {
          if (childScreenList[1].data.total_rows > 0) {
            sortedScreenList = getScreeningsList(
              childEntry.id,
              childScreenList[1].data.rows
            );
            sortedScreenList.forEach(function (entry, screenIndex) {
              lineAccumulator.push(
                addLineToStack(
                  childIndex + 1,
                  screenIndex + 1,
                  childEntry.key,
                  entry,
                  childScreenList[0].parms.sortField,
                  childScreenList[0].stake,
                  childScreenList[0].parms.stakeName,
                  childScreenList[0].parms.language,
                  childScreenList[0].parms.cCode,
                  entry.muac,
                  entry.familyHealthPlan,
                  entry.followFamilyHealthPlan,
                  entry.visitedDoctor
                )
              );
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
  var linesToAdd = [];

  womanScreenList.forEach(function (dataSet) {
      dataSet.data.rows.forEach(function (womanEntry) {
        linesToAdd.push(
          addWomenToStack(
            womanEntry.key
          )
        );
      });
  });
  return linesToAdd;
}

function newDBRequest(stake, stakeName, parmObj, view) {
  return new Promise(function (resolve, reject) {
    try {
      var couchURL;
      if (process.env.COUCH_URL.indexOf("localhost") > -1) {
        couchURL = "http://" + process.env.COUCH_URL + "/";
      } else {
        couchURL =
          "https://" +
          process.env.SYNC_ENTITY +
          "@" +
          process.env.COUCH_URL +
          "/";
      }
      var newObj = Object.assign({}, parmObj);
      request.get(
        couchURL + stake + "/_design/" + view + "/_view/screen",
        (error, response) => {
          if (!error && response.statusCode === 200) {
            var jsonObj;
            try {
              jsonObj = JSON.parse(response.body);
              resolve({
                stake: stake,
                stakeName: stakeName,
                parms: newObj,
                data: jsonObj,
                view: view,
              });
            } catch (e) {
              console.log("Error JSON.Parse dbRequest");
              reject(e);
              // resolve({ stake: stake, stakeName: stakeName, parms: newObj, data: [], view: view });
            }
          } else {
            try {
              console.log(
                `${response.statusCode} returned from couch access ${stake}`
              );
            } catch (err) {
              console.log(err);
            }
            // resolve({ stake: stake, stakeName: stakeName, parms: newObj, data: {}, view: view });
            reject(
              new Error(
                `${response.statusCode} returned from couch access ${stake}`
              )
            );
          }
        }
      );
    } catch (err) {
      console.log(err.message);
      reject(err);
    }
  });
}

async function getWomen(parmObj, multiplier) { // Deal with Multipler
  return new Promise((resolve) => {
    function accessDB(parmObj) {
      console.log(`emit CSV_progress ${parmObj.stakeName}from getWomen`);
      parmObj.socketObj.emit("CSV_progress", {
        room: parmObj.socketRoom,
        text: `${parmObj.stakeName} being processed`,
        count: multiplier,
    });

    var newObj = Object.assign({}, parmObj);
    var stake = parmObj.stakeDB;
    return resolve(
      Promise.join(
        newDBRequest(stake, parmObj.stakename, newObj, "pregnant_women"),
        newDBRequest(stake, parmObj.stakename, newObj, "nursing_mothers")
      )
    );
  }
    return setTimeout(accessDB, 750 * multiplier, parmObj);
  });
}

async function getChildAndData(parmObj, multiplier) {
  return new Promise((resolve) => {
    function accessDB(parmObj) {
      console.log(`emit CSV_progress ${parmObj.stakeName}from getChildAndData`);
      parmObj.socketObj.emit("CSV_progress", {
        room: parmObj.socketRoom,
        text: `${parmObj.stakeName} being processed`,
        count: multiplier,
      });
      // console.log(`${parmObj.stakeName} just emitted from get childAndData on server`);
      var newObj = Object.assign({}, parmObj);
      var stake = parmObj.stakeDB;
      return resolve(
        Promise.join(
          newDBRequest(stake, parmObj.stakeName, newObj, "children_list"),
          newDBRequest(stake, parmObj.stakeName, newObj, "scr_list")
        )
      );
    }
    // console.log(`start ${ parmObj.stakeName } in ${ multiplier } seconds`);
    return setTimeout(accessDB, 750 * multiplier, parmObj);
  });
}

async function writeHeader(fileToWrite, headerLine) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`files/${fileToWrite}`, headerLine, (err) => {
      if (err) {
        console.log(err);
        reject(err.message);
      } else {
        resolve(fileToWrite);
      }
    });
  });
}

async function appendStake(fileToWrite, data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(`files/${fileToWrite}`, data, (err) => {
      if (err) {
        // console.log(err);
        reject(err.message);
      }
      resolve(fileToWrite);
    });
  });
}

function addChildToLine(
  screenType,
  existingOwnerInfo,
  screenInfo,
  sortField,
  stakeDB,
  filter,
  supType,
  timeSinceLastScreen,
  priorMalNurish,
  language,
  ccode,
  stakeName
) {
  const ownerInfo = existingOwnerInfo;
  ownerInfo.sup = supType;
  ownerInfo.sinceLastScreen = timeSinceLastScreen;
  if (
    typeof ownerInfo.mother === "string" &&
    ownerInfo.mother.indexOf(",") > -1
  ) {
    ownerInfo.mother = ownerInfo.mother.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.firstName === "string" &&
    ownerInfo.firstName.indexOf(",") > -1
  ) {
    ownerInfo.firstName = ownerInfo.firstName.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.lastName === "string" &&
    ownerInfo.lastName.indexOf(",") > -1
  ) {
    ownerInfo.lastName = ownerInfo.lastName.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.phone === "string" &&
    ownerInfo.phone.indexOf(",") > -1
  ) {
    ownerInfo.phone = ownerInfo.phone.replace(/,/g, " ");
  }
  if (typeof ownerInfo.ward === "string" && ownerInfo.ward.indexOf(",") > -1) {
    ownerInfo.ward = ownerInfo.ward.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.address === "string" &&
    ownerInfo.address.indexOf(",") > -1
  ) {
    ownerInfo.address = ownerInfo.address.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.idGroup === "string" &&
    ownerInfo.idGroup.indexOf(",") > -1
  ) {
    ownerInfo.idGroup = ownerInfo.idGroup.replace(/,/g, " ");
  }
  var dataLine;
  var message;
  var currentAge = moment().diff(
    moment(new Date(ownerInfo.birthDate)),
    "months"
  );
  var priorMessage =
    language === "en"
      ? `${priorMalNurish}`
      : `${priorMalNurish === "yes" ? "si" : "no"}`;

  if (screenType === "chronicSup") {
    dataLine = `,,,,,,${supType},${currentAge},${priorMessage},${ownerInfo.firstName},${ownerInfo.lastName},${ownerInfo.ward},${ownerInfo.mother},${timeSinceLastScreen}`;
    if (stakeName) {
      dataLine += "," + ccode + "," + stakeName;
    }
    dataLine += "\n";

    return {
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      language: language,
    };
  }

  if (screenType === "missedScreening") {
    dataLine = `${currentAge},${ownerInfo.firstName},${ownerInfo.lastName},${ownerInfo.ward},${ownerInfo.mother},${timeSinceLastScreen}`;
    if (stakeName) {
      dataLine += "," + ccode + "," + stakeName;
    }
    dataLine += "\n";

    return {
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      language: language,
    };
  }

  if (supType.indexOf("risk") > -1) {
    // message = language === 'en' ? ' months since last screening\n'
    //   : ' meses desde la última evaluación\n';
    if (screenType === "sup") {
      dataLine =
        "" +
        "," +
        "," +
        "," +
        "," +
        "," +
        "," +
        "," +
        currentAge +
        "," +
        priorMessage +
        "," +
        ownerInfo.firstName +
        "," +
        ownerInfo.lastName +
        "," +
        ownerInfo.ward +
        "," +
        ownerInfo.mother +
        "," +
        timeSinceLastScreen +
        "\n";
    }
    return {
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      atRisk: true,
      language: language,
    };
  } else if (supType.indexOf("none") > -1) {
    // message = language === 'en' ? ' months since last screening\n'
    //   : ' meses desde la última evaluación\n';
    // dataLine = '' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward
    //   + ',' + ownerInfo.mother + ',' + timeSinceLastScreen;
    if (screenType === "sup") {
      dataLine = `,,,,,,,${currentAge},${priorMessage},${ownerInfo.firstName},${ownerInfo.lastName},${ownerInfo.ward},${ownerInfo.mother},${timeSinceLastScreen}`;
      if (stakeName) {
        dataLine += "," + ccode + "," + stakeName;
      }
      dataLine += "\n";
    }

    return {
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      normalZscore: true,
      language: language,
    };
  } else if (screenInfo === undefined || timeSinceLastScreen > 6) {
    if (timeSinceLastScreen === undefined || timeSinceLastScreen === 100) {
      var messageProb =
        language === "en"
          ? " no screenings: possible duplicate?\n"
          : " sin proyecciones: posible duplicado?\n";
      // dataLine = '' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward
      if (screenType === "sup") {
        dataLine = `,,,,,,,${currentAge},${priorMessage},${ownerInfo.firstName},${ownerInfo.lastName},${ownerInfo.ward},${ownerInfo.mother}`;
        if (stakeName) {
          dataLine += "," + ccode + "," + stakeName;
        }
        dataLine += "," + "," + messageProb + "\n";
      }
    } else {
      // var messageRisk = language === 'en' ? '  months since last screening\n'
      //   : ' meses desde la última evaluación , Niño en riesgo: debería pasar a la siguiente evaluación\n';
      if (
        priorMalNurish === "yes" &&
        currentAge <= 24 &&
        currentAge >= 6 &&
        timeSinceLastScreen < 7
      ) {
        if (supType !== "MAM" && supType !== "SAM") {
          supType === "sup";
        }
      }
      // dataLine = '' + ',' + ',' + ',' + ',' + ',' + ',' + supType + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName + ',' + ownerInfo.ward
      //   + ',' + ownerInfo.mother + ',' + timeSinceLastScreen;
      if (screenType === "sup") {
        dataLine = `,,,,,,${supType},${currentAge},${priorMessage},${ownerInfo.firstName},${ownerInfo.lastName},${ownerInfo.ward},${ownerInfo.mother},${timeSinceLastScreen}`;
        if (stakeName) {
          dataLine += "," + ccode + "," + stakeName;
        }
        dataLine += "\n";
      }
    }
    return {
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      missedScreen: true,
      language: language,
    };
  } else {
    // dataLine = '' + ',' + ',' + ',' + ',' + ',,' + supType + ',' + currentAge + ',' + priorMessage + ',' + ownerInfo.firstName + ',' + ownerInfo.lastName
    //   + ',' + ownerInfo.ward + ',' + ownerInfo.mother + ',' + timeSinceLastScreen;
    if (
      priorMalNurish === "yes" &&
      currentAge <= 24 &&
      currentAge >= 6 &&
      timeSinceLastScreen < 7
    ) {
      if (supType !== "MAM" && supType !== "SAM") {
        supType === "sup";
      }
    }
    if (currentAge < 6) {
      supType = "";
    }

    if (screenType === "sup") {
      dataLine = `,,,,,,${supType},${currentAge},${priorMessage},${ownerInfo.firstName},${ownerInfo.lastName},${ownerInfo.ward},${ownerInfo.mother},${timeSinceLastScreen}`;
      if (stakeName) {
        dataLine += "," + ccode + "," + stakeName;
      }
      dataLine += "\n";
    }

    return {
      data: ownerInfo,
      dataLine: dataLine,
      stakeDB: stakeDB,
      sortField: sortField,
      filter: filter,
      language: language,
    };
  }
}

function addLineToStack(
  childCount,
  screenCount,
  ownerInfo,
  screenInfo,
  sortField,
  stakeDB,
  stakeName,
  language,
  cCode,
  muac,
  familyHealthPlan,
  followFamilyHealthPlan,
  visitedDoctor
) {
  if (
    typeof ownerInfo.address === "string" &&
    ownerInfo.address.indexOf(",") > -1
  ) {
    ownerInfo.address = ownerInfo.address.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.mother === "string" &&
    ownerInfo.mother.indexOf(",") > -1
  ) {
    ownerInfo.mother = ownerInfo.mother.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.father === "string" &&
    ownerInfo.father.indexOf(",") > -1
  ) {
    ownerInfo.father = ownerInfo.father.replace(/,/g, " ");
  }
  if (typeof ownerInfo.city === "string" && ownerInfo.city.indexOf(",") > -1) {
    ownerInfo.city = ownerInfo.city.replace(/,/g, " ");
  }
  if (typeof ownerInfo.ward === "string" && ownerInfo.ward.indexOf(",") > -1) {
    ownerInfo.ward = ownerInfo.ward.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.firstName === "string" &&
    ownerInfo.firstName.indexOf(",") > -1
  ) {
    ownerInfo.firstName = ownerInfo.firstName.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.lastName === "string" &&
    ownerInfo.lastName.indexOf(",") > -1
  ) {
    ownerInfo.lastName = ownerInfo.lastName.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.idGroup === "string" &&
    ownerInfo.idGroup.indexOf(",") > -1
  ) {
    ownerInfo.idGroup = ownerInfo.idGroup.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.phone === "string" &&
    ownerInfo.phone.indexOf(",") > -1
  ) {
    ownerInfo.phone = ownerInfo.phone.replace(/,/g, " ");
  }
  if (muac === undefined) {
    muac = " ";
  }
  if (familyHealthPlan === undefined) {
    familyHealthPlan = " ";
  }
  if (followFamilyHealthPlan === undefined) {
    followFamilyHealthPlan = " ";
  }
  if (visitedDoctor === undefined) {
    visitedDoctor = " ";
  }
  if (!ownerInfo.firstName) {
    console.log("firstName invalid");
    ownerInfo.firstname = "unknown";
  }
  if (!ownerInfo.lastName) {
    console.log("lastName invalid");
    ownerInfo.lastName = "unknown";
  }
  var dataObj = {
    childId: ownerInfo._id,
    gender: screenInfo.gender[0].toUpperCase() + screenInfo.gender.substr(1),
    firstName: ownerInfo.firstName,
    lastName: ownerInfo.lastName,
    birthDate: ownerInfo.birthDate,
    idGroup: ownerInfo.idGroup || "",
    mother: ownerInfo.mother || "",
    father: ownerInfo.father || "",
    city: ownerInfo.city || "",
    phone: ownerInfo.phone || "",
    address: ownerInfo.address || "",
    ward: ownerInfo.ward || "",
    memberStatus: ownerInfo.memberStatus || "",
    lastScreening: ownerInfo.lastScreening,
    obese: ownerInfo.obese,
    screeningID: screenInfo.id,
    weight: screenInfo.weight,
    height: screenInfo.height,
    age: screenInfo.monthAge,
    ha: screenInfo.zScore.ha,
    wa: screenInfo.zScore.wa,
    wl: screenInfo.zScore.wl,
    surveyDate: screenInfo.surveyDate,
    screenId: screenInfo._id,
    muac: muac,
    familyHealthPlan: familyHealthPlan,
    followFamilyHealthPlan: followFamilyHealthPlan,
    visitedDoctor: visitedDoctor,
  };

  const zscoreStatus = calculateStatus(screenInfo);
  var dataLine =
    cCode +
    "," +
    stakeName +
    "," +
    childCount +
    "," +
    stakeDB +
    "," +
    screenCount +
    "," +
    dataObj.childId +
    "," +
    dataObj.gender +
    "," +
    dataObj.firstName +
    "," +
    dataObj.lastName +
    "," +
    dataObj.birthDate +
    "," +
    dataObj.idGroup +
    "," +
    dataObj.mother +
    "," +
    dataObj.father +
    "," +
    dataObj.phone +
    "," +
    dataObj.address +
    "," +
    dataObj.city +
    "," +
    dataObj.ward +
    "," +
    dataObj.memberStatus +
    "," +
    dataObj.screenId +
    "," +
    dataObj.surveyDate +
    "," +
    dataObj.weight +
    "," +
    dataObj.height +
    "," +
    dataObj.age +
    "," +
    dataObj.obese +
    "," +
    dataObj.ha +
    "," +
    dataObj.wa +
    "," +
    dataObj.wl +
    "," +
    zscoreStatus.zscoreStatus +
    "," +
    muac +
    "," +
    familyHealthPlan +
    "," +
    followFamilyHealthPlan +
    "," +
    visitedDoctor +
    "," +
    "\n";
  return {
    data: dataObj,
    dataLine: dataLine,
    stakeDB: stakeDB,
    stakeName: stakeName,
    sortField: sortField,
    filter: "listall",
  };
}

function addSummaryLineToStack(
  screentype,
  screenInfo,
  ownerInfo,
  sortField,
  stakeDB,
  stakeName,
  language,
  cCode,
  summary,
  familyHealthPlan,
  followFamilyHealthPlan,
  visitedDoctor
) {
  var cleanDate;
  if (
    typeof ownerInfo.address === "string" &&
    ownerInfo.address.indexOf(",") > -1
  ) {
    ownerInfo.address = ownerInfo.address.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.mother === "string" &&
    ownerInfo.mother.indexOf(",") > -1
  ) {
    ownerInfo.mother = ownerInfo.mother.replace(/,/g, " ");
  }
  if (typeof ownerInfo.city === "string" && ownerInfo.city.indexOf(",") > -1) {
    ownerInfo.city = ownerInfo.city.replace(/,/g, " ");
  }
  if (typeof ownerInfo.ward === "string" && ownerInfo.ward.indexOf(",") > -1) {
    ownerInfo.ward = ownerInfo.ward.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.firstName === "string" &&
    ownerInfo.firstName.indexOf(",") > -1
  ) {
    ownerInfo.firstName = ownerInfo.firstName.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.lastName === "string" &&
    ownerInfo.lastName.indexOf(",") > -1
  ) {
    ownerInfo.lastName = ownerInfo.lastName.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.idGroup === "string" &&
    ownerInfo.idGroup.indexOf(",") > -1
  ) {
    ownerInfo.idGroup = ownerInfo.idGroup.replace(/,/g, " ");
  }
  if (
    typeof ownerInfo.phone === "string" &&
    ownerInfo.phone.indexOf(",") > -1
  ) {
    ownerInfo.phone = ownerInfo.phone.replace(/,/g, " ");
  }
  if (!ownerInfo.firstName) {
    console.log("firstName invalid");
    ownerInfo.firstname = "unknown";
  }
  if (!ownerInfo.lastName) {
    console.log("lastName invalid");
    ownerInfo.lastName = "unknown";
  }
  if (
    typeof screenInfo.surveyDate === "string" ||
    screenInfo.surveyDate === null
  ) {
    if (screenInfo.surveyDate === null) {
      cleanDate = "N/A";
    } else {
      var surveyDay = screenInfo.surveyDate;
      const date = new Date(surveyDay);
      var day = date.getDate();
      var month = 1 + date.getMonth();
      var year = date.getFullYear();

      cleanDate = day + "/" + month + "/" + year;
    }
  }

  var dataObj = {
    childId: ownerInfo._id,
    firstName: ownerInfo.firstName,
    lastName: ownerInfo.lastName,
    birthDate: ownerInfo.birthDate,
    idGroup: ownerInfo.idGroup || "",
    mother: ownerInfo.mother || "",
    father: ownerInfo.father || "",
    city: ownerInfo.city || "",
    phone: ownerInfo.phone || "",
    address: ownerInfo.address || "",
    ward: ownerInfo.ward || "",
    memberStatus: ownerInfo.memberStatus || "",
    lastScreening: ownerInfo.lastScreening,
    surveyDate: cleanDate,
    screenId: screenInfo._id,
    stakeName: stakeName,
    country: cCode,
    childStatus: summary.childStatus,
    childProgress: summary.childProgress,
    age: summary.currentAge,
    coordArea: summary.coordinatingArea,
    familyHealthPlan: familyHealthPlan,
    followFamilyHealthPlan: followFamilyHealthPlan,
    visitedDoctor: visitedDoctor,
  };

  var dataLine =
    dataObj.mother +
    "," +
    dataObj.firstName +
    "," +
    dataObj.lastName +
    "," +
    dataObj.age +
    "," +
    dataObj.memberStatus +
    "," +
    dataObj.ward +
    "," +
    dataObj.childStatus +
    "," +
    dataObj.stakeName +
    "," +
    /* Consejo */ " " +
    "," +
    dataObj.country +
    "," +
    /* Saliendo */ " " +
    "," +
    dataObj.surveyDate +
    "," +
    dataObj.phone +
    "," +
    dataObj.address +
    "," +
    dataObj.childProgress +
    "," +
    dataObj.coordArea +
    "," +
    familyHealthPlan +
    "," +
    followFamilyHealthPlan +
    "," +
    visitedDoctor +
    "\n";

  return {
    data: dataObj,
    dataLine: dataLine,
    stakeDB: stakeDB,
    stakeName: stakeName,
    sortField: sortField,
    filter: "listall",
  };
}

function addWomenToStack(input, stakeDB, sortField, filter, language) {
  var parmObj = input;
  if (parmObj.address !== undefined && parmObj.address.indexOf(",") > -1) {
    parmObj.address = parmObj.address.replace(/,/g, " ");
  }
  if (parmObj.city !== undefined && parmObj.city.indexOf(",") > -1) {
    parmObj.city = parmObj.city.replace(/,/g, " ");
  }
  if (parmObj.ward !== undefined && parmObj.ward.indexOf(",") > -1) {
    parmObj.ward = parmObj.ward.replace(/,/g, " ");
  }
  if (parmObj.firstName !== undefined && parmObj.firstName.indexOf(",") > -1) {
    parmObj.firstName = parmObj.firstName.replace(/,/g, " ");
  }
  if (parmObj.lastName !== undefined && parmObj.lastName.indexOf(",") > -1) {
    parmObj.lastName = parmObj.lastName.replace(/,/g, " ");
  }
  var dataObj = {
    firstName: parmObj.firstName,
    lastName: parmObj.lastName,
    city: parmObj.city || "",
    phone: parmObj.phone || "",
    address: parmObj.address || "",
    ward: parmObj.ward || "",
    memberStatus: parmObj.memberStatus || "",
    surveyDate: parmObj.created,
    screenId: parmObj._id,
  };
  if (parmObj.childsBirthDate) {
    dataObj.childsBirthDate = parmObj.childsBirthDate;
  } else {
    dataObj.deliveryDate = parmObj.deliveryDate;
  }

  var dataLine =
    dataObj.firstName +
    "," +
    dataObj.lastName +
    "," +
    dataObj.phone +
    "," +
    dataObj.address +
    "," +
    dataObj.city +
    "," +
    dataObj.ward +
    "," +
    dataObj.memberStatus +
    "," +
    dataObj.created;
  if (parmObj.childsBirthDate) {
    dataLine = dataLine + "," + dataObj.childsBirthDate + "\n";
  } else {
    dataLine = dataLine + "," + dataObj.deliveryDate + "\n";
  }
  return {
    data: dataObj,
    dataLine: dataLine,
    stakeDB: stakeDB,
    sortField: sortField,
    filter: filter,
    language: language,
  };
}

function buildOutputData(listIn) {
  let accumulate = "";
  listIn.listIn.forEach(function (child) {
    accumulate = accumulate.concat(child.dataLine);
  });
  return accumulate;
}

function sortList(listIn) {
  listIn.forEach(function (entry, index) {
    if (entry.sortField === undefined) {
      listIn[index].sortField = "firstName";
    }
  });
  try {
    listIn.sort(function (x, y) {
      try {
        if (
          x.data[x.sortField].toUpperCase() < y.data[x.sortField].toUpperCase()
        ) {
          return -1;
        }
      } catch (err) {
        console.log(err);
      }
      if (
        x.data[x.sortField].toUpperCase() > y.data[x.sortField].toUpperCase()
      ) {
        return 1;
      }
      if (
        x.data[x.sortField].toUpperCase() === y.data[x.sortField].toUpperCase()
      ) {
        return 0;
      }
      return 0;
    });
  } catch (err) {
    console.log(err);
  }

  return { listIn: listIn };
}

async function updateStatusStake(stakeInfo, timeOutMultiplier) {
  try {
    const screeningData = await getChildAndData(stakeInfo, timeOutMultiplier);

    return await updateSupplementStatus(screeningData, stakeInfo.stakeDB);
  } catch (err) {
    return stakeInfo;
  }
}

async function saveStake(stakeInfo, timeOutMultiplier) {
  try {
    let childData;
    console.log(
      `calling getChildAndData from saveStake ${stakeInfo.stakeName}`
    );
    const screeningData = await getChildAndData(stakeInfo, timeOutMultiplier);
    if (stakeInfo.csvType === "women") {
      const motherData = await getWomen(stakeInfo, timeOutMultiplier);
      const womenData = buildOutputData(sortList(listWomen(motherData)));
      return appendStake(stakeInfo.fileToSave, womenData);
    } else if (stakeInfo.csvType === "sup") {
      childData = buildOutputData(
        splitSups(
          sortList(
            listAllChildren(screeningData, stakeInfo.csvType, stakeInfo.cCode)
          )
        )
      );
    } else if (stakeInfo.csvType === "summary") {
      childData = buildOutputData(
        sortList(
          listAllChildren(
            screeningData,
            stakeInfo.csvType,
            stakeInfo.cCode
          )
        )
      );
    } else if (stakeInfo.csvType === "missedScreening") {
      childData = buildOutputData(
        sortList(
          listAllChildren(
            screeningData,
            stakeInfo.csvType,
            stakeInfo.cCode
          )
        )
      );
    } else {
      childData = buildOutputData(
        sortList(listAllChildren(screeningData, stakeInfo.csvType))
      );
    }
    console.log(
      `saving stake ${stakeInfo.stakeName} and multiplier ${timeOutMultiplier}`
    );
    if (stakeInfo.csvType != "women") {
      return appendStake(stakeInfo.fileToSave, childData);
    }
  } catch (err) {
    return stakeInfo;
  }
}

function parseJwt(token) {
  let parts = token.split(" ");
  return jwt_decode(parts[1]);
}

exports.compactDB = function (req, res) {
  var stakeDb = nano(
    "https://" +
      process.env.SYNC_ENTITY +
      "@" +
      process.env.COUCH_URL +
      "/" +
      req.params.stakeDB
  );

  stakeDb.compact(req.params.stakeDB, (err, body) => {
    if (err) {
      return res.status(400).send({
        message: err.message,
      });
    }
    return res.status(200).send({
      message: `${req.params.stakeDB} compacted`,
    });
  });
};

exports.updateZscoreStatus = async function (req, res) {
  let serverReady = false;
  function reportUpdateComplete(input, socketClient, socketRoom) {
    socketClient.emit("CSV_complete", {
      room: socketRoom,
      text: "zscore update complete",
    });
    // socketObj.removeListener('CSV_status');
    socketClient.removeAllListeners();
    socketClient.close();
    // return;
    // return res.status(200).send({
    //   message: input
    // });
  }

  let socketClient = io(`http://localhost:${process.env.PORT}/csvStatus`, {
    agent: false, // [2] Please don't set this to true
    upgrade: false,
    rejectUnauthorized: true,
    query: `token=chocolate&sessionID=${req.sessionID}&nsp=${req.query.nsp}`,
  });

  // socketClient.removeAllListeners();
  socketClient.on("connect", () => {
    // console.log('server client connected');
    socketClient.emit("room", {
      room: req.query.socketRoomId,
      src: "server client",
    });
  });

  socketClient.on("Server_ready", async (data) => {
    // console.log(`we have server ready ${ data.text }`);
    moment.locale(req.params.language);
    // let stakeList = await getDBListFromFile(parmObj);
    // res.status(202).send({ message: 'Request has been received ', nsp: req.query.socketId });

    var parmObj = {
      stakeDB: req.params.stakeDB,
      stakeName: req.params.stakeName,
      scopeType: req.params.scopeType,
      cCode: req.params.cCode,
      socketRoom: req.query.socketRoomId,
      socketObj: socketClient,
      updateProcess: updateStatusStake,
    };

    getDBListFromFile(parmObj)
      .map(
        (stakeToSave) => {
          return stakeToSave;
        },
        { concurrency: 1 }
      )
      .then((results) => {
        reportUpdateComplete(results, socketClient, parmObj.socketRoom);
      })
      .catch((error) => {
        console.log(error.message);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error),
        });
      });
    serverReady = true;
  });
};

exports.createCSVFromDB = async function (req, res) {
  let serverReady = false;

  function reportCSVComplete(input) {
    return res.status(200).send({
      message: input,
    });
  }

  function reportAggregateComplete(
    input,
    retryCount,
    processToExec,
    socketObj,
    socketRoom
  ) {
    const toRetry = input.filter((retVal) => {
      return typeof retval === "string";
    });
    if (toRetry.length === 0) {
      // console.log(`emit CSV_complete ${ input[0] }`);
      socketObj.emit("CSV_complete", {
        room: socketRoom,
        text: `${input[0]} created and ready for download`,
        fileName: input[0],
      });
      // socketObj.removeListener('CSV_status');
      socketObj.removeAllListeners();
      socketObj.close();
      return;
      // return res.status(200).send({
      //   message: input[0]
      // });
    }
    console.log(`stakes to retry = ${toRetry.length}`);
    if (retryCount < 1) {
      socketObj.emit("CSV_error", {
        room: input.socketRoom,
        text: `CSV creation failed after ${retryCount} retries`,
        fileName: input.fileToSave,
      });
      socketObj.close();
      return;
    }
    const stakeRetryList = [];
    toRetry.forEach((stakeToRetry) => {
      stakeRetryList.push(processToExec(stakeToRetry, 2));
    });
    try {
      Promise.map(
        stakeRetryList,
        (stakeToSave) => {
          return stakeToSave;
        },
        { concurrency: 1 }
      )
        .then((results) => {
          setTimeout(
            reportAggregateComplete,
            10000,
            results,
            retryCount - 1,
            processToExec,
            socketObj,
            socketRoom
          );
        })
        .catch((error) => {
          // console.log(error.message);
          socketObj.emit("CSV_error", {
            room: input.socketRoom,
            text: errorHandler.getErrorMessage(error),
            fileName: input.fileToSave,
          });
          socketObj.close();
        });
    } catch (err) {
      console.log(err);
    }
  }
  const tokenInfo = parseJwt(req.headers.authorization);
  // console.log('open the socket from the server');
  let socketClient = io(`http://localhost:${process.env.PORT}/csvStatus`, {
    agent: false, // [2] Please don't set this to true
    upgrade: false,
    rejectUnauthorized: true,
    query: `token=chocolate&sessionID=${req.sessionID}&nsp=${req.query.nsp}`,
  });

  // socketClient.removeAllListeners();
  socketClient.on("connect", () => {
    // console.log('server client connected');
    socketClient.emit("room", {
      room: req.query.socketRoomId,
      src: "server client",
    });
  });

  socketClient.on("Server_ready", async (data) => {
    // console.log(`we have server ready ${ data.text }`);
    moment.locale(req.params.language);
    var parmObj = {
      responseObj: res,
      stakeName: req.query.stakeName,
      stakeDB: req.params.stakeDB,
      scopeType: req.params.scopeType,
      cCode: req.params.cCode,
      sortField: req.params.sortField,
      language: req.params.language,
      csvType: req.params.csvType,
      fileToSave: `${req.params.stakeDB}_${tokenInfo.iat}_dbDump.csv`,
      socketRoom: req.query.socketRoomId,
      socketObj: socketClient,
      monthSelect: req.params.monthSelect,

      updateProcess: saveStake,
    };
    // let stakeList = await getDBListFromFile(parmObj);
    res
      .status(202)
      .send({ message: "Request has been received ", nsp: req.query.socketId });
    // if (parmObj.csvType === "women") {
    //   parmObj.fileToSave = `mother_${req.params.stakeDB}_${tokenInfo.iat}_dbDump.csv`;
    //   const headerLine =
    //     parmObj.language === "en"
    //       ? "country,stakeName,id,firstName,lastName,idGroup,phone,address,city,ward,lds,screenDate,other date\n"
    //       : "País,Estaca,carné de identidad,nombre de pila,apellido,grupo de identificación,teléfono,dirección,ciudad,sala,miembro lds,fecha de la pantalla, otra fecha\n";

    // } else {
      parmObj.fileToSave = `sup_list_${req.params.stakeDB}_${tokenInfo.iat}_dbDump.csv`;
      let headerLine =
        parmObj.language === "en"
          ? "1,2,3,4,5,6,Sup,age,Prior Sup,firstName,lastName,ward,mother,months since last screening\n"
          : "1,2,3,4,5,6,Sup,anos,Anterior Sup,nombre de pila,apellido,sala,madre,meses desde la última evaluación\n";
      if (parmObj.stakeName) {
        headerLine =
          "1,2,3,4,5,6,Sup,age,Prior Sup,firstName,lastName,ward,mother,months since last screening,country,stake\n";
      }
      if (parmObj.csvType === "women") {
        parmObj.fileToSave = `mother_${req.params.stakeDB}_${tokenInfo.iat}_dbDump.csv`;
        headerLine =
          parmObj.language === "en"
            ? "firstName,lastName,phone,address,city,ward,lds,screenDate,deliveryDate\n"
            : "nombre de pila,apellido,teléfono,dirección,ciudad,sala,miembro lds,fecha de la pantalla,fecha de entrega\n";
      } else if (parmObj.csvType === "chronicSup") {
        parmObj.fileToSave = `chronic_sup_list_${req.params.stakeDB}_${tokenInfo.iat}_dbDump.csv`;
        headerLine =
          "1,2,3,4,5,6,Sup,age,Prior Sup,firstName,lastName,ward,mother,months since last screening,country,stake\n";
      } else if (parmObj.csvType === "summary") {
        parmObj.fileToSave = `summary_${req.params.stakeDB}_${
          tokenInfo.iat
        }_${moment().format()}_dbDump.csv`;
        headerLine =
          "mothersName, firstName,lastName,age,LDS,ward,status,stake,Counsel,country,Leaving,LastScreeningDate,phone,address,ImprovementFromLastScreening,CoordinatingCounsel,FamilyHealthPlan,FollowFamilyHealthPlan,VisitedDoctorOrHealthClinic\n";
      } else if (parmObj.csvType === "missedScreening") {
        parmObj.fileToSave = `missed_screening_list_${req.params.stakeDB}_${tokenInfo.iat}_dbDump.csv`;
        headerLine =
          "age,firstName,lastName,ward,mother,months since last screening,country,stake\n";
      } else if (parmObj.csvType !== "sup") {
        parmObj.fileToSave = `${tokenInfo.iat}_${req.params.cCode}_${req.params.csvType}_dbDump.csv`;
        headerLine =
          "Country,Stake,child Index,stake db name,screen Count,id,gender,firstName,lastName,birthdate,idGroup,mother,father,phone,address,city,ward,lds,screenId,screenDate,weight,height,age,obese,ha,wa,wh,status,muac,FamilyHealthPlan,FollowFamilyHealthPlan,VisitedDoctorOrHealthClinic\n";
      }

      if (parmObj.scopeType === "countries") {
        parmObj.fileToSave = `${tokenInfo.iat}_all_data_${req.params.csvType}_dbDump.csv`;
      }

      // res.status(202).write(`Received request to create${ parmObj.fileToSave }`);

      // socketClient.emit('CSV_start', {
      //   room: parmObj.socketRoom,
      //   text: `Received request to create${ parmObj.fileToSave }`,
      //   fileName: parmObj.fileToSave
      // });
      await writeHeader(parmObj.fileToSave, headerLine);
      getDBListFromFile(parmObj)
        .map(
          (stakeToSave) => {
            return stakeToSave;
          },
          { concurrency: 1 }
        )
        .then((results) => {
          reportAggregateComplete(
            results,
            retryLimit,
            parmObj.updateProcess,
            socketClient,
            parmObj.socketRoom
          );
        })
        .catch((error) => {
          socketClient.emit("CSV_error", {
            room: parmObj.socketRoom,
            text: errorHandler.getErrorMessage(error),
          });
          socketClient.close();
        });
    serverReady = true;
  });

  socketClient.on("disconnect", () => {
    // console.log('disconnected remove listener at server');
    socketClient.removeAllListeners();
  });
};

exports.getSyncURL = function (req, res) {
  return res.json({
    entity: process.env.SYNC_ENTITY,
    url: process.env.COUCH_URL,
  });
};

exports.getCountryList = function (req, res) {
  request.get(
    "https://" +
      process.env.COUCH_URL +
      "/country_list/liahona_kids_countries_stakes",
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj;
        var reasons;
        try {
          jsonObj = JSON.parse(response.body);
          res.json(jsonObj);
        } catch (error) {
          // console.log('JSON.parse error');
          reasons.error = "JSON.parse error";
          reasons.reason = "?";
          return res.status(400).send({
            message: reasons,
          });
        }
      } else {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error),
        });
      }
    }
  );
};

function parseCsv(input, cb) {
  fs.rename(input, input + ".csv", function (err) {
    if (err) {
      console.log(err);
    } else {
      cb(
        csvParse.parseFiles(input + ".csv", {
          delimiter: ",",
          dynamicTyping: true,
        })
      );
    }
  });
}

function gradeZScores(screenObj) {
  screenObj.zScore.haStatus = "normalZscore";
  screenObj.zScore.waStatus = "normalZscore";
  screenObj.zScore.wlStatus = "normalZscore";
  if (screenObj.zScore.ha < -2) {
    screenObj.zScore.haStatus = "redZoneZscore";
  } else if (screenObj.zScore.ha < -1 && screenObj.zScore.ha > -2) {
    screenObj.zScore.haStatus = "marginalZscore";
  }
  if (screenObj.zScore.wa < -2) {
    screenObj.zScore.waStatus = "redZoneZscore";
  } else if (screenObj.zScore.wa < -1 && screenObj.zScore.wa > -2) {
    screenObj.zScore.waStatus = "marginalZscore";
  }
  if (screenObj.zScore.wl < -3) {
    screenObj.zScore.wlStatus = "dangerZscore";
  } else if (screenObj.zScore.wl < -2 && screenObj.zScore.wl > -3) {
    screenObj.zScore.wlStatus = "redZoneZscore";
  } else if (screenObj.zScore.wl < -1 && screenObj.zScore.wl > -2) {
    screenObj.zScore.wlStatus = "marginalZscore";
  }
  return screenObj;
}

function buildScreens(dataBase, childId, screenList) {
  // const docEntrys = [];
  return screenList.map((screening) => {
    const scrObj = screening.screen;
    if (!scrObj._id) {
      // if we have the id, use it
      scrObj._id = "scr__" + dataBase + "_" + uuid();
      scrObj.owner = childId;
    }
    return scrObj;
    // docEntrys.push(scrObj);
  });
  // return docEntrys;
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
    childInfo._id = "chld_" + dataBase + "_" + uuid();
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
  var zscoreStatus = "";
  if (screeningObj.zScore.wl < -2) {
    zscoreStatus = "Acute: supplements required";
  } else if (
    (screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) &&
    screeningObj.monthAge > 6 &&
    screeningObj.monthAge < 36
  ) {
    zscoreStatus = "Acute: supplements required";
  } else if (
    (screeningObj.zScore.ha < -2 || screeningObj.zScore.wa < -2) &&
    screeningObj.monthAge > 36 &&
    screeningObj.monthAge < 60
  ) {
    zscoreStatus = "Micro nutrients required";
  } else if (
    screeningObj.zScore.ha < -1 ||
    screeningObj.zScore.wa < -1 ||
    screeningObj.zScore.wl < -1
  ) {
    zscoreStatus = "At Risk: Come to next screening";
  } else {
    zscoreStatus = "Normal";
  }
  return { screeningObj: screeningObj, zscoreStatus: zscoreStatus };
}

function statusColor(status) {
  if (~status.indexOf("Acute")) {
    return "redZoneZscore";
  } else if (~status.indexOf("Micro")) {
    return "redZoneZscore";
  } else if (~status.indexOf("Risk")) {
    return "marginalZscore";
  } else {
    return "normalZscore";
  }
}

async function buildScreenList(dataBase, input) {
  var i;
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
    if (~columnData[0][i].toLowerCase().indexOf("firstname")) {
      firstNameIndex = i;
    } else if (columnData[0][i].toLowerCase() === "id") {
      idIndex = i;
    } else if (columnData[0][i].toLowerCase() === "scrid") {
      scrIdIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("lastname")) {
      lastNameIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("mother")) {
      motherIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("father")) {
      fatherIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("birthdate")) {
      birthDateIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("address")) {
      addressIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("city")) {
      cityIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("ward")) {
      wardIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("phone")) {
      phoneIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("age")) {
      monthAgeIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("gender")) {
      genderIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("weight")) {
      weightIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("height")) {
      heightIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("ha")) {
      haIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("wa")) {
      waIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("wh")) {
      whIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("lds")) {
      ldsIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("screendate")) {
      surveyDateIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("idgroup")) {
      idGroupIndex = i;
    } else if (~columnData[0][i].toLowerCase().indexOf("status")) {
      statusIndex = i;
    } else {
      console.log(columnData[0][i]);
    }
  }

  var dataBaseObj = [];
  var j;
  for (j = 1; j < columnData.length - 1; j++) {
    var childObj = {};
    var screenObj = {
      zScore: {
        ha: "",
        haStatus: "",
        wa: "",
        waStatus: "",
        wl: "",
        wlStatus: "",
      },
    };
    childObj.birthDate = columnData[j][birthDateIndex];
    childObj.firstName = columnData[j][firstNameIndex];
    childObj.lastName = columnData[j][lastNameIndex];
    childObj.mother =
      motherIndex !== 0 ? columnData[j][motherIndex] : undefined;
    childObj.father =
      fatherIndex !== 0 ? columnData[j][fatherIndex] : undefined;
    childObj.address =
      addressIndex !== 0 ? columnData[j][addressIndex] : undefined;
    childObj.city = cityIndex !== 0 ? columnData[j][cityIndex] : undefined;
    childObj.ward = wardIndex !== 0 ? columnData[j][wardIndex] : undefined;
    childObj.phone = phoneIndex !== 0 ? columnData[j][phoneIndex] : undefined;
    childObj.monthAge = columnData[j][monthAgeIndex];
    childObj.gender = columnData[j][genderIndex];
    childObj.lds = columnData[j][ldsIndex];
    childObj.idGroup = columnData[j][idGroupIndex];
    if (idIndex !== 0) {
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

    dataBaseObj.push({ db: dataBase, child: childObj, screen: screenObj });
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
    });
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
    var stakeDb = nano(
      "https://" +
        process.env.SYNC_ENTITY +
        "@" +
        process.env.COUCH_URL +
        "/" +
        dataBase
    );
    return stakeDb.bulk({ docs: docs }, (err, body) => {
      if (!err) {
        return resolve(body);
      }
      reject(err);
    });
  });
}

exports.uploadCsv = async function (req, res) {
  function returnOk() {
    if (errorStack.length > 0) {
      return res.status(400).send({ message: errorStack.join() });
    }
    return res.status(200).send({ message: "update complete" });
  }

  var upload = csvloader(config.uploads.csvUpload).single("newUploadCsv");
  // Filtering to upload only images
  upload.fileFilter = require(path.resolve(
    "./config/lib/csvloader.js"
  )).csvUploadFileFilter;

  upload(req, res, function (uploadError) {
    if (uploadError) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(uploadError),
      });
    } else {
      // parse csv
      parseCsv(res.req.file.path, async (parsedData) => {
        try {
          const bulkData = await buildScreenList(
            req.params.stakeDB,
            parsedData
          );
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

exports.jiraWebhook = function (req, res) {
  var event = req;
  return res.status(200).send({});
};

exports.listDbs = function (req, res) {
  request.get(
    "https://" +
      process.env.SYNC_ENTITY +
      "@" +
      process.env.COUCH_URL +
      "/_all_dbs",
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj;
        try {
          jsonObj = JSON.parse(body);
          res.json(jsonObj);
        } catch (error) {
          // console.log('error in JSON.parse listDbs');
          return res.status(400).send({
            message: errorHandler.getErrorMessage(error),
          });
        }
      } else {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error),
        });
      }
    }
  );
};

exports.removeCSV = function (req, res) {
  fs.unlink(req.params.csvName, (err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err),
      });
    } else {
      return res.status(200).send({});
    }
  });
};

// var parmObj = {
//   responseObj: res,
//   stakeName: req.query.stake,
//   stakeDB: req.params.stakeDB,
//   scopeType: req.params.scopeType,
//   cCode: req.params.cCode,
//   sortField: req.params.sortField,
//   language: req.params.language,
//   csvType: req.params.csvType,
//   fileToSave: `${ req.params.stakeDB }_${tokenInfo.iat}_dbDump.csv`,
//   updateProcess: saveStake
// };
// exports.queueCsvJob = function(req, res) {
//   sqs.createQueue({
//     QueueName: CSV_QUEUE
//   }, (err, data) => {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       sqs.sendMessage({
//         MessageBody: 'requesting csv creation',
//         QueueUrl: data.QueueUrl,
//         MessageAttributes: {
//           'CSVFileName': {
//             DataType: 'String',
//             StringValue: req.params.csvName
//           },
//           'CSVScope': {
//             DataType: 'String',
//             StringValue: req.params.csvScope
//           },
//           'CSVCountryCode': {
//             DataType: 'String',
//             StringValue: req.params.csvCCode
//           }
//         }
//       }, (err, data) => {
//         if (err) {
//           return res.status(400).send({
//             message: errorHandler.getErrorMessage(err)
//           });
//         } else {
//           return res.status(200).send({ queue: data.QueueUrl });
//         }
//       });
//     }
//   });
// };

// exports.progressCsvJob = function(req, res) {
//   sqs.getQueueAttributes({
//     QueueUrl: req.params.QueueUrl,
//     AttributeNames: 'ApproximateNumberOfMessages'
//   }, (err, data) => {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       return res.status(200).send({ queue: data.QueueUrl });
//     }
//   });
//   sqs.receiveMessage({
//     QueueUrl: req.params.QueueUrl,
//     // AttributeNames: [
//     //   'All'
//     // ],
//     MessageAttributeNames: [
//       'All'
//     ],
//     MaxNumberOfMessages: 10,
//     VisibilityTimeout: 1
//   }, (err, data) => {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       return res.status(200).send({ queue: data.QueueUrl });
//     }
//   });
// };

function getDBListFromFile(parmsIn) {
  return new Promise(function (resolve, reject) {
    request.get(
      "https://" +
        process.env.COUCH_URL +
        "/country_list/liahona_kids_countries_stakes",
      function (error, response) {
        if (!error && response.statusCode === 200) {
          var jsonObj;
          let stakes = [];
          let stakeList = [];
          let countryList = [];

          try {
            jsonObj = JSON.parse(response.body);
            countryList = jsonObj.countries;
            if (parmsIn.scopeType === "stake") {
              let parmObj = Object.assign({}, parmsIn);
              // parmObj.stakeDB = stake.stakeDB;
              // parmObj.stakeName = stake.stakeName;
              stakeList.push(parmObj.updateProcess(parmObj, 0));
              // resolve(stakeList);
            } else if (parmsIn.scopeType === "country") {
              let country = countryList.filter((country) => {
                return country.code === parmsIn.cCode;
              });
              country[0].stakes.forEach((stake, index) => {
                if (!stake.stakeDB.startsWith("test")) {
                  let parmObj = Object.assign({}, parmsIn);
                  parmObj.stakeDB = stake.stakeDB;
                  parmObj.stakeName = stake.stakeName;
                  stakeList.push(parmObj.updateProcess(parmObj, index));
                }
              });
            } else if (parmsIn.scopeType === "countries") {
              let stakeCount = 0;
              countryList.forEach((country) => {
                country.stakes.forEach((stake, index) => {
                  stakeCount += 1;
                  if (!stake.stakeDB.startsWith("test")) {
                    let parmObj = Object.assign({}, parmsIn);
                    parmObj.stakeDB = stake.stakeDB;
                    parmObj.stakeName = stake.stakeName;
                    parmObj.cCode = country.code;
                    stakeList.push(parmObj.updateProcess(parmObj, stakeCount));
                  }
                });
              });
            }
            // console.log('we have a stakelist ready to process');
            parmsIn.socketObj.emit("CSV_progress", {
              room: parmsIn.socketRoom,
              text: "sending back the count",
              maxCount: stakeList.length,
            });
            resolve(stakeList);
          } catch (err) {
            console.log("JSON.parse error");
            reject(err);
          }
        } else {
          reject();
        }
      }
    );
  });
}
