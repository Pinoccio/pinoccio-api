
var route = require('./route.js')

var xtend = require('xtend');

var actions = {
  troop:require('./actions/troop'),
  stream:require('./actions/stream')
}

module.exports = function(db,boards,routes){
  return function(args,cb){
    route(args,routes,function(err,data){
      // generic. responds to commands the same way no matter the transport
      if(err) return cb(err);

      var action = data.data.action
      var parts = action.split('/');
      if(actions[parts[0]] && actions[parts[0]][parts[1]]){
        // post<get<params
        var actionData = xtend(data.data.post,data.data.get,data.data.params)
        t = setTimeout(function(){
          var c = cb();
          cb = function(){};
          c(new Error('timeout running action'));
        },10000);
        return actions[parts[0]][parts[1]](actionData,{db:db,boards:boards},function(err,data){
          clearTimeout(t);
          cb(err,data)
        });
      }

      cb(new Error('invalid action '+action+' in routes.'));

    });
  }
}

