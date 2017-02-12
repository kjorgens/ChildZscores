var request = require('request');
var Promise = require('bluebird');

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
  },
  {
    "_id": "_design/scr_owner_search",
    "views": {
      "find_by_owner": {
        "map": "function(doc){emit(doc.owner, doc)}"
      }
    }
  }
];
function outOfHere(input){
  console.log("done");
}

getdatabaseList()
    .then(checkUpdateViews)
    .then(outOfHere).catch(function(err){
  console.log("error" + err);
});

function validateView(input) {
  return new Promise(function(resolve,reject) {
    var stakeDb = require ('nano') ('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + input.db);
    var viewObject;
    if(~input.type.indexOf('view')){
      viewObject = {_id: input.view._id, views: input.view.views};
    }
    if(~input.type.indexOf('filter')){
      viewObject = {_id: input.view._id, filters: input.view.filters};
    }
    stakeDb.get(input.view._id, function(err, body) {
      if (err) {
        stakeDb.insert(viewObject, function(err, response) {
          if (err) {
            var msg = '';
            var updateError = new Error(err.message);
            console.log(input.db + " " + err.message);
            reject(updateError);
          } else {
            console.log('view ' + input.view._id + ' created in ' + input.db);
            resolve('view ' + input.view._id + ' created in ' + input.db);
          }
        });
      } else {
        console.log('view exists or error ' + input.db);
        resolve(input.view._id + ' already exists');
      }
    })
  })
}

function checkUpdateViews (stakeList) {
  var toCheck = [];
  stakeList.forEach(function(stakeDB){
    viewList.forEach (function (view) {
      toCheck.push ({type: 'view', db: stakeDB, view: view});
    });
    filterList.forEach (function (filter) {
      toCheck.push ({type: 'filter', db: stakeDB, view: filter});
    });
  });
  return Promise.each(toCheck, validateView);
}

function getdatabaseList(){
  return new Promise(function(resolve,reject){
    var stakeList = [];

    var countryList = require('nano')('https://' + process.env.COUCH_URL + 'country_list');
    countryList.get('liahona_kids_countries_stakes', function(err, body) {
      if (err) {
        reject('could not get db list');
      } else {
        var countryFound = false;
        if(process.env.COUNTRY) {
          for(i=0; i<body.countries.length && !countryFound; i++) {
            country = body.countries[i];
            if (~process.env.COUNTRY.toUpperCase ().indexOf (country.name.toUpperCase ())) {
              country.stakes.forEach (function (stake) {
                stakeList.push (stake.stakeDB);
                countryFound = true;
              })
            }
          }
          if(countryFound) {
            resolve (stakeList);
          } else {
            var emptyError = new Error();
            emptyError.name = 'Database not found';
            emptyError.message = process.env.COUNTRY + ' database not found';
            reject(emptyError);
          }
        } else {
          body.countries.forEach( function(country) {
            country.stakes.forEach (function (stake){
              stakeList.push (stake.stakeDB);
            })
          });
          resolve(stakeList);
        }
      }
    })
  })
}




