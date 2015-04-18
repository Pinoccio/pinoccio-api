


module.exports = {
  // troops
  troops:function(data,o,cb){
    o.db.get(cb);
  },
  get:function(data,o,cb){ 
    if(!data.troop) return cb(new Error('troop id required'));
    o.db.get(data.troop,cb);
  },
  patch:function(data,o,cb){
    if(!data.troop) return cb(new Error('troop id required'));
    data.id = data.troop;
    delete data.troop;
    delete data.version;
    data.update = Date.now();
    o.db.writeTroop(data,cb);
  },
  del:function(data,o,cb){
    if(!data.troop) return cb(new Error('troop id required'));
    o.db.deleteTroop(data.troop,cb); 
  },
  addTroop:function(data,o,cb){
    data.id = data.troop;
    delete data.troop;
    delete data.version;
    data.create = data.update = Date.now();
    o.db.writeTroop(data,cb); 
  },
  // scouts
  getScout:function(data,o,cb){
    o.db.get(data.troop,data.scout,cb); 
  },
  addScout:function(data,o,cb){
    troop = data.troop;
    delete data.version;
    data.create = data.update = Date.now();
    o.db.writeScout(troop,data,cb);
  },
  delScout:function(data,o,cb){
    o.db.deleteScout(data.troop,data.scout,cb); 
  },
  patchScout:function(data,o,cb){
    data.id = data.scout;
    if(!data.id) return cb(new Error('cannot find the id!')); 

    delete data.scout;
    delete data.version;
    data.update = Date.now();

    o.db.writeScout(data.troop,data,cb);
  },
  // commands!
  command:function(data,o,cb){
    console.log('get troop data',data);
    o.db.getTroopData(data.troop,function(err,tdata){
      console.log(err,tdata);

      if(err) return cb(err);
      console.log(Object.keys(o.boards));
      if(!o.boards[tdata.key]) return cb(new Error('this board is not connected.'));

      
      console.log('ABOUT TO RUN COMMAND > ',data.scout,data.command);
      o.boards[tdata.key].command(data.scout,data.command,cb);
    })
  }
}

