
var route = require('./route.js')


module.exports = function(db,routes){
  return function(args,cb){
    console.log(args);
    route(args,routes,function(err,data){
      // generic. responds to commands the same way no matter the transport.
      cb(err,[data,args]);
    });
  }
}
