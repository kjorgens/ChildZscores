/**
 * Created by karljorgensen on 7/15/16.
 */
// 'strict';

var fs = require('fs'),
promise = require('bluebird');

var fstreamin = fs.createReadStream( '/Users/karljorgensen/Downloads/wfhboys.csv');
var fstreamout = fs.createWriteStream('/Users/karljorgensen/wfhboysOut.js');

transferData();

function transferData(){
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('/Users/karljorgensen/Downloads/wfhboys.csv')
  });

  lineReader.on('line', function (line) {

    console.log('Line from file:', line);
    var parts = line.split(',');
    fstreamout.write('    { y: ' + parts[0] +', L: ' + parts[1] + ', M: ' + parts[2] + ', S: ' + parts[3] +' },\n');
  });

}