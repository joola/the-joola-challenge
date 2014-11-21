var Primus = require('primus');

module.exports = function(server) {
  var primus = new Primus(server, { transformer: 'engine.io', pathname: '/primus' });
  primus.save(__dirname + '/../public/components/primus.js');
  return primus;
}