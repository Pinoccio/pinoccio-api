// handle uploads of form data with size limit
var qs = require('querystring')
var json = require('./json')
var undef;

module.exports = function(req,limit,cb){
  // capture and parse the request body.
  
  if(!req.headers['content-type'] || req.headers['content-type'] == 'json' || req.headers['content-type'].indexOf('application/x-www-form-urlencoded') > -1) {

    // limit to 2k of post data before bailing out. this is not an upload api.
    var limit = limit||1024*2;
    var c = 0,bufs = [],called = false;
    var done = function(err,data){
      if(called) return;
      called = true;
      cb(err,data);
    };
    req.on('error',function(err){
      done(err);
    }).on('data',function(data){
      c+=data.length;
      if(c > limit) {
        bufs = [];
        done({code:400,message:req.url+' too much post data '+req.method});
        return;
      }
      bufs.push(data);
    }).on('end',function(){
      bufs = Buffer.concat(bufs).toString();
      var post;
      if(bufs.indexOf('{') === 0) {
        post = json(bufs);
      }

      if(post === undef) {
        try{
          post = qs.parse(bufs+''); 
        } catch(e) {
          return done({code:400,message:req.url+' could not read post data '+req.method});
        }
      }
      done(false,post);
    });
    return;
  } else {
    cb(false,{});
  }
}


