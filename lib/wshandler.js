var rpcStream = require('rpc-stream');
var mdm = require('mux-demux');

module.exports = function(handler){
    var handler = function(ws){
      // call standard handler for each message.
      // handle streams etc.
      m = mdmSetup(handler);

      ws.pipe(m).pipe(ws);

      ws.on('error',function(){
        m.end();
      })

      m.on('error',function(){
        ws.end(); 
      })
    }
}

function mdmSetup(standardHandler){
  var m;
  m = mdm(function(stream){
    console.log('ws+mdm > ',stream.id,'new stream> ',stream.meta);
    if(stream.meta === "rpc"){
      stream.pipe(rpcStream({
        rest:function(args,cb){

          console.log('ws+mdm rest '+stream.id+'> ',args);

          var _url = false;//args[0]?args[0].url:false;
          standardHandler(args,function(err,data){

            //todo.
            var tracking = {url:_url,error:err?1:0};

            if(data && typeof data.pipe == 'function'){
              // if data is a stream create a stream on the remote end callback with a stream id
              tracking.stream = false;

              cb(false,{error:error(err),stream:++outputStreamId});
              // now create a stream on the client!
              var outside = data.pipe(m.createStream({type:"rest-stream",id:outputStreamId}));
              // i had to do this for the plain stream case so im adding it here too. though its not the same because the stream starts on this side.
              outside.on('end',function(){
                data.end();
              })

            } else {
              tracking.stream = false;
              //console.log('rest response ',err,data);
              // this is ugly but it helps me distiguish from error response and broken request on the fe.
              cb(false,{error:error(err),data:data});
            }

            //trackCall(tracking);
          });
        }
      })).pipe(stream);
    } else if(stream.meta) {
      // basic stream types.
      //{ type: 'rest', args: { url: '/v1/1',data: { token: 'a3gp4p3efqs9oopje1luv6lb67' },method: 'get' } }
      
      if(stream.meta.type == "rest") {
        //console.log('rest stream.');
        standardHandler(stream.meta.args,function(err,data){
          if(err) {
            // this gets called when you do not have permission to make a call.
            stream.error(err);
          } else if(data && typeof data.pipe === 'function'){
            // i have responded with a stream
            //console.log('PIPING REST STREAM TO OUTPUT STREAM');
            data.pipe(stream);
            data.on('error',function(err){
              stream.error({message:err.message,code:err.code});
            });

            // if the outside is ended stop sending data right away.
            stream.on('end',function(){
              data.end();
            });
          } else {
            if(data) stream.emit('data',data)
            stream.end();
          }
        })
      } else {
        stream.end("404");
      }
    } else {
      stream.end('"404"');
    }
  });

  return m;
}


