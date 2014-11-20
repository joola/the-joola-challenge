var joola = angular.module('joola', []);

joola.controller('VisitsCtrl', ['$scope', '$http', function($scope, $http) {

  $http.get('/visits').then(function(res) {
    if (res.status == 200) {
      console.log(res.data);
    }
  })

}])
