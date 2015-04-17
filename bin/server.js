var db = require('pinoccio-db')(__dirname+'/db');

var server = require('../');

var s = server(db);

s.on('data',console.log);



