'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngResource',
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.headers.common.Accept = 'application/json';
}]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/queue', {templateUrl: 'partials/queue.html', controller: 'QueueCtrl'});
  $routeProvider.when('/detail', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl'});
  $routeProvider.otherwise({redirectTo: '/queue'});
}]);
