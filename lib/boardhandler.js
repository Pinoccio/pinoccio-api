
var phandler = require('pinoccio-server').handler;

// TODO
module.exports = function(db){
  var handler = phandler({handler:function(troop){
    console.log('have a troop! TODO. update the database. create the wrte stream!');
    console.log('troop!',troop);
  }})
  return handler;
}
