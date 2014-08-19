'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller(
    'QueueCtrl',
    [
      '$scope',
      '$routeParams',
      '$location',
      '$timeout',
      'QueueClient',
      'esFactory',
      'setup_index',
      'username',
      function($scope, $routeParams, $location, $timeout,  QueueClient,
               esFactory, setup_index, username) {
        $scope.max = Math.max;
        $scope.min = Math.min;
        $scope.path = $location.path();
        $scope.query = $routeParams.q;
        $scope.from = parseInt($routeParams.from || 0, 10);
        $scope.size = parseInt($routeParams.size || 10, 10);

        username.then(function(result) {
          $scope.name = result.data.full_name;
        }).catch(function(error) {
          console.log(error);
        });

        $scope.search = function(event) {
          if (!$scope.query) {
            $scope.query = undefined;  // clear empty strings
          }
          QueueClient.search({
            index: 'description_queue',
            type: 'piece_meta',
            from: $scope.from,
            size: $scope.size,
            q: $scope.query,
          }).then(
            function(response) {
              $scope.count = response.hits.total;
              $scope.queue = response.hits.hits;
            },
            function(error) {
              console.log(error.message);
              setup_index();
              $timeout($scope.search, 2000);
            }
          );
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
