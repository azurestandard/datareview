'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller(
    'QueueCtrl',
    [
      '$scope',
      '$routeParams',
      '$location',
      'PieceMeta',
      function($scope, $routeParams, $location, PieceMeta) {
        $scope.max = Math.max;
        $scope.min = Math.min;
        $scope.path = $location.path();
        $scope.from = parseInt($routeParams.from || 0, 10);
        $scope.size = parseInt($routeParams.size || 10, 10);
        $scope.count = PieceMeta.count();
        $scope.queue = PieceMeta.query({from: $scope.from, size: $scope.size});
      }
    ]
  )
  .controller(
    'DetailCtrl',
    [
      '$scope',
      '$routeParams',
      '$location',
      'PieceMeta',
      function($scope, $routeParams, $location, PieceMeta) {
        $scope.item = PieceMeta.get({id: $routeParams.id});
        $scope.save = function() {
          PieceMeta.save(
            $scope.item,
            function(value, responseHeaders) {  // success
              $location.path('/queue');
            },
            function(httpResponse) {  // error
              if (httpResponse.status == 400) {
                // TODO: display errors from httpResponse.data
                // {'$field': ['$error_1', '$error_2', ...], ...}
                console.log(httpResponse.data);
              } else {
                // TODO: display lower-level error
                console.log(httpResponse.status, httpResponse.statusText);
              }
            }
          );
        };
      }
    ]
  );
