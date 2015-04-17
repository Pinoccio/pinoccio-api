
var formdata = require('./formdata');
var staticHandler = require('ecstatic')({root:__dirname+'/../static/',defaultExt:'html',gzip:true});
var through2 = require('through2');

module.exports = function(handler){
  return function(req,res){
    if(req.url.indexOf('/s/') === 0) return staticHandler(req,res);

    formdata(req,1024*2,function(err,data){
      if(err) return send(err);

      var args = {
        url:req.url,
        headers:req.headers,
        data:data
      };

      handler(args,function(err,data){
        send(err,data,req,res);
      });
    });
  }
}

function send(err,data,req,res){
  var streamResponse = !err && data && typeof data.pipe === "function";

  res.setHeader('content-type','application/json');
  if(streamResponse) res.setHeader('x-stream','application/json');

  // access-control allow origin.
  res.setHeader('Access-Control-Allow-Origin:','*');

  if(err) {
    err = error(err);
    res.writeHead(err.code||500);
  } else {
    // if err is falsy leave it out of json responses.
    err = undefined;
    res.writeHead(200);
  }

  // pipe stream support for curl!
  if(streamResponse){
    var out = through2(function(data,enc,cb){
      this.push(JSON.stringify({data:data})+"\n");
      cb();
    }).on('end',function(){
      data.end();
    });

    var errh = function(){
       data.end();
       out.end();
       res.destroy();
    };

    // wild pipe juggling. can probably clean this up a bit. =)
    data.on('error',function(err){
      out.queue(JSON.stringify({error:{message:err.message,code:err.code}})+"\n");
      out.end();
    })
    .pipe(out).on('error',errh)
    .pipe(res).on('error',errh);

    res.on('close',function(){
      out.end();
    })
  } else { 
    data = {error:err,data:data};
    res.end(JSON.stringify(data)+"\n");
  }

}

