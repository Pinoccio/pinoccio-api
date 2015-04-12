
var test = require('tape');
var db = require('../util/db.js');

test("can require index sin blow up",function(t){
  var api = require('../');
  t.ok(api,'has export');
  var o = api(db())
  t.ok(o,'can get instance');
  o.close();
  t.end();
})
