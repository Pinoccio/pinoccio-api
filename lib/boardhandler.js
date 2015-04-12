
var phandler = require('pinoccio-server').handler;

module.exports = function(){
  var handler = phandler({handler:function(troop){
    console.log('have a troop! TODO. update the database. create the wrte stream!');

  }})
  return handler;
}
