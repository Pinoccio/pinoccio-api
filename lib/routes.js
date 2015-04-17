
var version = ':version';
var troop = version+'/:troop';
var scout = troop+'/:scout'

module.exports = function(more){
  var routes = [
    // streams.
    ,[version+"/sync",{'get':'account/sync'}]
    ,[version+"/stats",{'get':'account/stats'}]

    // new troop token.
    ,[version+"/account/troop",{'put':'account/associate','post':'account/associate'}]
    // list all the troops in my account
    ,[version+"/troops",{'get':'account/troops'}]


    // get 
    ,[troop,{'get':'troop/get','patch':'troop/patch','delete':'troop/del'}]
    // get all scouts i guess. 
    ,[troop+"/scouts",{'get':'troop/scouts'}]
    // add new scout id to troop and return it for provisioning.
    ,[troop+'/scout',{put:'troop/addScout',post:'troop/addScout'}]


    // get the status for a specific scout and del a scout
    ,[scout,{'get':'troop/getScout','delete':"troop/delScout","patch":"troop/patchScout"}]
    // expose any bitlash
    ,[scout+"/command",{"get":'troop/command',"post":"troop/command"}]
    ,[scout+"/command/:command",{"get":'troop/command'}]
    // add support for cmd shorthand
    ,[scout+"/cmd",{"get":'troop/command',"post":"troop/command"}]
    ,[scout+"/cmd/:command",{"get":'troop/command'}]
  ]


  // add new routes after.
  if(more && Array.isArray(more)){
    routes.push.apply(routes,more);
  }

  return routes;

}

