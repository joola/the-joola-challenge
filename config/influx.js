var influx = require('influx');

var client = influx({
  host : 'localhost',
  username : 'root',
  password : 'root'
});

client.getDatabaseNames(function(err, names) {
  if (names.indexOf('joola') < 0) {
    client.createDatabase('joola', function(err) {
      if (err) {
        console.error(err);
        return;
      }
      client.options.database = 'joola';
    })
  } else {
    client.options.database = 'joola';
  }
})



module.exports = client;