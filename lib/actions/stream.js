module.exports = {
  sync:function(data,o,cb){
    console.log('sync!')
    var s = o.db.sync({tail:data.tail});
    var em = s.emit;
    s.emit = function(ev,data){
      console.log('sync event> ',ev);
      em.apply(this,arguments);
    }
    cb(false,s);
  },
  stats:function(data,o,cb){
    if(!data.report || !data.scout || !data.troop) return cb(new Error('missing required troop, scout, or report'));


    var s = o.db.stats(data.troop,data.scout,{report:data.report,start:data.start,end:data.end,tail:data.tail})

    cb(false,s);
  }
}
