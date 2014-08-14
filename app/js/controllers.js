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
  .controller('DetailCtrl', ['$scope', function($scope) {

  }]);
