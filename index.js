var http = require('http');
var through2 = require('through2');
var rpcStream = require('rpc-stream');
var mdm = require('mux-demux');
var shoe = require('shoe');

var httphandler = require('./lib/httphandler');
var webSockethandler = require('./lib/wshandler');
var commonHandler = require('./lib/commonhandler');


// expects a pinoccio-db object.

module.exports = function(db,options){
  options = options||{};

  // add time to logs.
  var o = through2.obj(function(data,enc,cb){
    cb(false,{log:data,time:Date.now()})
  });


  var servers = [];

  servers.push(http.createServer(handler)
  .listen(options.port||8020,function(err,data){
    if(err) o.emit('error',err);
    o.write (["listening",this.address()]);
  }));

  // todo add https server if cert is in options.


  var shoeServer = shoe(webSockethander(hander));

  servers.forEach(function(){
    s.on('upgrade',function(){
      // hack around shoe so all headers are available in handler even when it goes through wsHandler
      req.headers['host'] = xtend(req.headers,{});
    })
  });

  o.servers = servers;
  o.shoe = shoeServer;

  o.on('close',function(){
    servers.forEach(function(s){
      s.close();
    });
  })

  return o;
}

