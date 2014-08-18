'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngResource',
  'ngRoute',
  'ui.keypress',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/queue', {templateUrl: 'partials/queue.html', controller: 'QueueCtrl'});
  $routeProvider.when('/detail/:id', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl'});
  $routeProvider.otherwise({redirectTo: '/queue'});
}]);
