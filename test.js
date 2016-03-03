require('colors')


const fs = require('fs');


var data = fs.readFileSync('nodejslist.js');
var data2 = fs.readFileSync('javascriptlist.js');
//console.log("Synchronous read: " + data);


var jsdiff = require('diff');

var one = 'beep boop';
var other = 'beep boob blah';

var diff = jsdiff.diffLines(data, data2);

diff.forEach(function(part){
  // green for additions, red for deletions
  // grey for common parts
  var color = part.added ? 'green' :
    part.removed ? 'red' : 'grey';
  process.stderr.write(part.value[color]);
});

console.log()