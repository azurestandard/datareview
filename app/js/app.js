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
config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.headers.common.Accept = 'application/json';

  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * Convert an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
}]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/queue', {templateUrl: 'partials/queue.html', controller: 'QueueCtrl'});
  $routeProvider.when('/detail/:id', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl'});
  $routeProvider.otherwise({redirectTo: '/queue'});
}]);
