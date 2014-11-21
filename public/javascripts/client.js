var joola = angular.module('joola', ['n3-line-chart']);

joola.factory('websocket', [ '$log',
  function ($log) {
    $log.info('Connecting WebSocket');

    var connection = Primus.connect('primus', {
      reconnect: {
        maxDelay: 60000,
        minDelay: 500,
        retries: 100
      }
    })

    return connection;
  }

])

joola.controller('VisitsCtrl', ['$scope', 'websocket', function($scope, websocket) {

  $scope.options = {
    axes: {
      x: {key: 'x', type: 'date'},
      y: {type: 'linear', min: 0, ticks: 5}
    },
    series: [
      {y: 'value', axis: "y", color: 'steelblue', thickness: '2px', type: 'line', label: '# Visits', drawDots: true}
    ],
    tooltip: {mode: "axes" },
    lineMode: "linear",
    tension: 0.7,
    drawLegend: true,
    tooltipMode: "dots"
  }

  websocket.on('data', function(visits) {
    $scope.$apply(function() {
      $scope.data = _.map(visits.points, function(point) {
        return {x: new Date(point[0]), value: point[1] }
      })
    })

  })

}])
