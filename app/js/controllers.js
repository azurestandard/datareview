'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller(
    'QueueCtrl',
    [
      '$scope',
      'PieceMeta',
      function($scope, PieceMeta) {
        $scope.queue = PieceMeta.query();
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
