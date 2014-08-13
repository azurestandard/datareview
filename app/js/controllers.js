'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller(
    'QueueCtrl',
    [
      '$scope',
      'PieceMeta',
      function($scope, PieceMeta) {
        PieceMeta.query(function(response) {
          $scope.queue = response;
        });
      }
    ]
  )
  .controller('DetailCtrl', ['$scope', function($scope) {

  }]);
