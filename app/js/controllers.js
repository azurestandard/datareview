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

        $scope.claim = function(item) {
          QueueClient.update({
            index: 'description_queue',
            type: 'piece_meta',
            id: item._id,
            refresh: true,
            body: {
              doc: {
                editor: $scope.name,
                claimed: (new Date()).toISOString(),
              },
              detect_noop: true,
            }
          }).then(function(result) {
            $scope.path = $location.path('/detail/' + item._source.id);
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
      'QueueClient',
      'esFactory',
      'username',
      function($scope, $routeParams, $location, PieceMeta, QueueClient,
               esFactory, username) {
        PieceMeta.get({id: $routeParams.id}).$promise.then(function(result) {
          $scope.item = result;
          return username;
        }).then(function(result) {
          $scope.name = result.data.full_name;
          return QueueClient.search({
            index: 'description_queue',
            type: 'piece_meta',
            body: {
              query: {
                match: {
                  id: $scope.item.id,
                }
              }
            }
          });
        }).then(function(result) {
          if (result.hits.hits.length == 0) {
            throw new Error(
              'no entry found for ' + $scope.item.name +
              ' (' + $scope.item.id + ') in Elasticsearch');
          } else if (result.hits.hits.length != 1) {
            throw new Error(
              result.hits.hits.length + ' entries found for ' +
              $scope.item.name + ' (' + $scope.item.id +
              ') in Elasticsearch');
          }
          $scope.queue_item = result.hits.hits[0];
        });

        $scope.save = function() {
          PieceMeta.save(
            $scope.item
          ).$promise.then(function(result) {
            return QueueClient.update({
              index: 'description_queue',
              type: 'piece_meta',
              id: $scope.queue_item._id,
              refresh: true,
              body: {
                doc: {
                  name: $scope.item.name,
                  finished: (new Date()).toISOString(),
                },
                detect_noop: true,
              }
            });
          }).then(function(result) {
            $scope.path = $location.path('/queue');
          });
        };
      }
    ]
  );
