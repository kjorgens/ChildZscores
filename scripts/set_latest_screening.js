var request = require('request');
var Promise = require('bluebird');

var stake = 'test_stake_bra';
setLatestScreening(stake)
    .then(updateDb).catch(function(err) {
  console.log(err.message);
});


function outOfHere(input) {
  console.log(input);
  process.exit(0);
}


function updateDb(screenings) {
  return new Promise(function(resolve, reject) {
    resolve(
        'update the db'
    );
    // var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + stake);
    //
    //     stakeDb.insert(
    //         {
    //
    //         }, function(err, response) {
    //           if (err) {
    //             console.log(err.message);
    //             reject(err.message);
    //           } else {
    //             console.log('ddoc filter created for ' + dataBase);
    //             resolve('created');
    //           }
    //         });
    //
    // });
  });
}

function getChildRecords(input){
  return new Promise(function(resolve,reject){
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + input.db);
    stakeDb.view('children_list', 'screen', function(error, response, body) {
      if (!error && response) {
        if (response.rows.length === 0) {
          var emptyError = new Error();
          emptyError.name = 'No Children Found';
          emptyError.message = 'No Children for ' + ownerId ;
          reject(emptyError);
        }
        if(response.data.rows === 0){
          var emptyError = new Error();
          emptyError.name = 'Empty database';
          emptyError.message = 'No screenings in ' + parmObj.stakeDB;
          reject(emptyError);
        }
        childList = [];
        response.rows.forEach(function(child) {
          childList.push(findLatestScreening(child.id));
        });
        resolve({childList: childList, db: input.db}).each();
      } else {
         reject(myError);
      }
    })
  })
}

function getLatestScreening(stakeDB){
  return new Promise(function(resolve,reject){
    console.log('going here: ' + 'https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + stakeDB);
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + '/' + stakeDB);
    stakeDb.view('scr_list', 'screen', function(error, response) {
      if (!error && response) {
        if (response.rows.length === 0) {
          var emptyError = new Error();
          emptyError.name = 'Empty database';
          emptyError.message = 'No screenings in ' + parmObj.stakeDB;
          reject(emptyError);
        }
        var screenList = [];
        // list of children, get their screenings
        response.rows.forEach(function(screening) {
          screenList.push(getChildRecords({screenId: screening.id, db: stakeDB}));
        });
        resolve(screenList).each();
      } else {
        reject(error);
      }
    });
  })
}

function goThroughList() {
  return new Promise(function (resolve, reject) {
    request.get('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL +
        '_all_dbs', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonObj = JSON.parse(body);
        jsonObj.forEach(function (dataBase) {
          if (dataBase[0] !== '_') {
            updateDb(dataBase);
          }
        });
      } else {
        resolve(console.log(error.message));
      }
    });
  });
}
