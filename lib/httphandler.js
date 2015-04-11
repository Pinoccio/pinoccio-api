
var formdata = require('./formdata');
var staticHandler = require('ecstatic')({root:__dirname+'/../static/',defaultExt:'html',gzip:true});

module.exports = function(handler){
  return function(req,res){
    if(req.url.indexOf('/s/') === 0) return staticHandler(req,res);

    formdata(req,1024*2,function(err,data){
      if(err) return send(err);
      req.data = data;
      handler(req,function(err,data){
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
    err = undef;
    res.writeHead(200);
  }

  // pipe stream support for curl!
  if(streamResponse){
    var out = through(function(data){
      this.queue(JSON.stringify({data:data})+"\n");
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

