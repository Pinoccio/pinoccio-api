var through2 = require('through2');
var phandler = require('pinoccio-server').handler;

// TODO
module.exports = function(db,boards){
  var handler = phandler({handler:function(troop){

    var afterToken = function(){
      // todo. more connections for the same troop etc.
      if(boards[troop.token]){
        boards[troop.token].end();
      }

      console.log('adding troop to boards ',troop.token);
      boards[troop.token] = troop;

      troop.pipe(through2.obj(function(data,enc,cb){
        data.troop = troop.dbdata.id;
        data.scout = data.from;
        if(!data.report) return cb();
        data.data = data.report;
        data.report = data.data.type||'';
        console.log(JSON.stringify(data)+"\n");
        this.push(data);
        cb();
      })).pipe(db.saveReportsStream());// TODO REMAKE WRITE STREAM ON ERROR. for now.. crash.

    }

    troop.on('end',function(){
      if(boards[this.token] === this) delete boards[this.token];
    })

    // find the troop's record.
    // find the scout.
    // start saving data.
    //
    console.log('token> ',troop.token);
    db.getTroopData(troop.token,function(err,data){
      console.log(err,data);
      if((err+'').indexOf('NotFoundError') > -1){
        // make new troop!
        var key = troop.token;
        if(key[0] == "\0"){
          // null tokens are from brand new scouts.
          key = undefined;
        }

        db.writeTroop({key:key},function(err,data){
          troop.dbdata = data;
          /*if(troop.token != data.key){
            troop.command(0,"mesh.sethqtoken("+data.key+");",function(){
            
            })
          }*/
          db.assignTroopKey({id:data.id,key:key},function(err){
            if(err) {
              console.log('error assigning troop key!',err);
              return troop.end();
            }
            afterToken(); 
          });
        });
        return;
      }

      troop.dbdata = data;
      //
      afterToken();

    });

  }})
  return handler;
}
