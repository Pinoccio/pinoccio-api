var http = require('http');
var net = require('net');
var through2 = require('through2');
var shoe = require('shoe');


var httphandler = require('./lib/httphandler');
var webSocketHandler = require('./lib/wshandler');
var commonHandler = require('./lib/commonhandler');
var boardHandler = require('./lib/boardhandler.js');

// expects a pinoccio-db object.

module.exports = function(db,options){
  options = options||{};

  // add time to logs.
  var o = through2.obj(function(data,enc,cb){
    cb(false,{log:data,time:Date.now()})
  });

  var handler = commonHandler();

  var servers = [];

  servers.push(http.createServer(httphandler(handler))
  .listen(options.port||8002,function(err,data){
    if(err) o.emit('error',err);
    else o.log(["listening",this.address()]);
  }));

  // todo add https server if cert is in options.


  var shoeServer = shoe(webSocketHandler(handler));

  servers.forEach(function(s){
    s.on('upgrade',function(){
      // hack around shoe so all headers are available in handler even when it goes through wsHandler
      req.headers['host'] = xtend(req.headers,{});
    })
  });

  var boardServers = [];

  //"port":22756,
  //"ssl-port":22757,


  boardServers.push(net.createServer(boardHandler(db))
  .listen(22756,function(err){
    if(err) o.emit('error',err);
    else o.log(["boardSerrver",this.address()]);
  })); 

  // add tls if cert is in options.

  o.servers = servers;
  o.shoe = shoeServer;
  o.boardServers = boardServers;

  o._close = function(){
    servers.forEach(function(s){
      s.close();
    });
    boardServers.forEach(function(s){
      s.close();
    });
  }

  o.log = function(msg){
    if(!o.writeable || o.closed) return;
    o.write(msg);
  }

  //TODO!
  o.close = function(){
    o.closed = true;
    //o.once('end',function(){
    //  this.emit('close');  
    //});
    //.once('error',function)
    //o.end();
    //this.end();
    this._close();
    this.emit('close');
    this.end();
  }

  return o;
}

