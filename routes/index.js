var express = require('express');
var primus = require('../config/primus').primus
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index');
})

module.exports = router;
