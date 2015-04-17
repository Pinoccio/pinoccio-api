//wip to document routes
var paramify = require('paramify');
var xtend = require('xtend');
var url = require('url');
var qs = require('querystring');


//req. may be an http request
// or its an object with {method:,url:,data:,state:}
// data is optional if present its expected that its a js object.
// state is optional it may contain auth information. 
module.exports = function(req,routes,cb){
  var out;
  var params;
  var methods;
  var method = req.method.toLowerCase();
  var parsed = url.parse(req.url||'',true);
  var pathname = parsed.pathname;
  var match = paramify(pathname);
  var authRequired = true;


  var route;
  for(var i=0;i<routes.length;++i){

    if(match(routes[i][0])) {
      params = match.params;
      methods = routes[i][1];
      route = routes[i][0];
      if(routes[i][2] === false) authRequired = false;
      break
    }
  }  

  console.log(req.url,req.method);

  if(params) {

    // paramify output is kinda weird.
    // i should probably stop using it and just use the url matching lib by tj it depends on.
    var _params = {}
    var keys = Object.keys(params)
    for(var i=0;i<keys.length;++i) _params[keys[i]] = params[keys[i]];
    _params._ = params;
    params = _params;

    var mkeys = Object.keys(methods);
    if(mkeys.indexOf(method) > -1) {
      var query = parsed.query||{}

      // valid method
      out = {
        error:false,
        data:{
          state:{
            token:query.token||(req.data||{}).token 
          },
          authRequired:authRequired,
          data:{
            method:method
            ,action:methods[method]
            ,url:parsed.pathname
            ,route:route
            ,params:params
            ,post:req.data
            ,get:query
          }
        }
      };

      if(req.state) {
        out.data.state = xtend(out.data.state,req.state);
      }
    } else {
      out = {
        error: {code:405,message:req.url+' does not accept '+method}
      }
    }
  } else {

    // figure out the right way to handle route errors here
    out = {
      error: {code:404,message:req.url+' is not a valid resource'}
    };

  }

  setImmediate(function(){
    cb(out.error?out.error:false,out.data);
  })
}
