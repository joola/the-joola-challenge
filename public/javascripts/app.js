var joola = angular.module('joola', ['n3-line-chart']);

joola.controller('VisitsCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.options = {
    axes: {
      x: {key: 'x', type: 'date'},
      y: {type: 'linear', min: 0, ticks: 5}
    },
    series: [
      {y: 'value', color: 'steelblue', thickness: '2px', type: 'line', label: 'Number of Visitors'}
    ]
  }

  $http.get('/visits').then(function(res) {
    if (res.status == 200) {
      if (res.data) {
        $scope.data = _.map(res.data.points, function(point) {
          console.log(point);
          return {x: new Date(point[0]), value: point[1] }
        })
      }

    }
  })

}])
