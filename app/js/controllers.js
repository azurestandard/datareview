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
        $scope.query = $routeParams.q;
        $scope.from = parseInt($routeParams.from || 0, 10);
        $scope.size = parseInt($routeParams.size || 10, 10);

        $scope.search = function(event) {
          $scope.count = PieceMeta.count({
            q: $scope.query,
          });
          $scope.queue = PieceMeta.query({
            q: $scope.query,
            from: $scope.from,
            size: $scope.size,
          });
        };

        $scope.search();
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
