// get an in memory db for testing.
var pdb = require('pinoccio-db');
var memdown = require('memdown');
var levelup = require('levelup');

module.exports = function(){
  return pdb(levelup({db:memdown,valueEncoding:'json'}));
}
