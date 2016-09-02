var request = require('request');
var Promise = require('bluebird');

goThroughList().catch(function(err) {
  console.log(err.message);
}).all().then(outOfHere);


function outOfHere(input) {
  console.log(input);
  process.exit(0);
}


function updateDb(dataBase) {
  return new Promise(function(resolve, reject) {
    var stakeDb = require('nano')('https://' + process.env.SYNC_ENTITY + '@' + process.env.COUCH_URL + dataBase);
    stakeDb.get('_design/filter_ddocs', function(err, body) {
      if (err) {
        stakeDb.insert(
          {
            _id: '_design/filter_ddocs',
            filters:
            {
              'ddocs': "function(doc, req) {if(doc._id[0] != '_') {return true} else {return false}  }"
            }
          }, function(err, response) {
          if (err) {
            console.log(err.message);
            reject(err.message);
          } else {
            console.log('ddoc filter created for ' + dataBase);
            resolve('created');
          }
        });
      } else {
        console.log('ddoc filter exists or error');
        resolve('already exists');
      }
    });
  });
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
