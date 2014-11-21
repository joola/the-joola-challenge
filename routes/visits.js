module.exports = function(primus) {
  var influx = require('../config/influx');

  primus.on('connection', function() {
    var point = { count: 1 };
    influx.writePoint('visits', point, {}, function() {
      getVisits(primus.write.bind(primus));
    })

  })

  function getVisits(callback) {
    var query = 'SELECT SUM(count) FROM visits GROUP BY time(1h) fill(0) WHERE time > now() - 1d';
    influx.query(query, function(err, visits) {
      callback(visits[0]);
    })
  }
}
