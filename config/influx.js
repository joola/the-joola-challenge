var influx = require('influx');

var client = influx({
  host : 'localhost',
  username : 'joola',
  password : 'joola',
  database : 'joola'
});

module.exports = client;