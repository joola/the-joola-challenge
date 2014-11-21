var express = require('express');
var router = express.Router();
var influx = require('../config/influx');

router.get('/', function(req, res) {
  var point = { count: 1 };
  influx.writePoint('visits', point, {}, function() {
    res.render('index', { title: 'Express' });
  })

});

router.get('/visits', function(req, res) {
  var query = 'SELECT SUM(count) FROM visits GROUP BY TIME(1h) WHERE time > now() - 1d';
  influx.query(query, function(err, visits) {
    res.json(200, visits[0]);
  })
})

module.exports = router;
