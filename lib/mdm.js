  var mdmSetup = function(){
    var streamingRaw = false;
    var m;
    m = mdm(function(stream){
      //console.log('ws+mdm > ',stream.id,'new stream> ',stream.meta);
      if(stream.meta === "rpc"){
        stream.pipe(rpc({
          rest:function(args,cb){
            //console.log('ws+mdm rest '+stream.id+'> ',args);
            //state.origin
            var _url = args[0]?args[0].url:false;
            api(args[0],state,function(err,data){

              var tracking = {url:_url,error:err?1:0};

              if(data && typeof data.pipe == 'function'){
                // if data is a stream create a stream on the remote end callback with a stream id
                tracking.stream = true;

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

              trackCall(tracking);
              //
              // todo raw event stream.
              if(streamingRaw) checkTroops(state);
            });
          }
        })).pipe(stream);
      } else if(stream.meta) {
        // basic stream types.
        //cons//ole.log('create stream. ',stream.meta);
        
        //{ type: 'rest', args: { url: '/v1/1',data: { token: 'a3gp4p3efqs9oopje1luv6lb67' },method: 'get' } }
        
        if(stream.meta.type == "rest") {
          //console.log('rest stream.');
          api(stream.meta.args,state,function(err,data){
            //console.log('rest stream cb ',err,data);

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
        } else if(stream.meta.type == "events"){

          console.log("creating raw events stream!");
          // handle raw event stream
          if(rawStream) rawStream.end();

          streamingRaw = true;
          rawStream = stream
          var clean = function (){
            rawStream = false;
            streamingRaw = false;
          }
          rawStream.on('end',clean).on('error',clean);
          checkTroops(state);
        }
      }
    });

    return m;
  }


