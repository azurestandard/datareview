'use strict';

// Declare app level module which depends on filters, and services
var dataReviewApp = angular.module('dataReview', [
    'config',
    'elasticsearch',
    'endpointFetcher',
    'es_client',
    'es',
    'jsFetcher',
    'ngGrid',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap',
    'dataReview.filters',
    'dataReview.services',
    'dataReview.directives',
    'dataReview.controllers'
]).
config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.headers.common.Accept = 'application/json';
}]);

dataReviewApp.run(['$rootScope', 'config',
    function($rootScope, config) {
        if (datareview_config) {
            config = datareview_config;
        }
        $rootScope.home_url = config.home_url || '#';
        $rootScope.home_label = config.home_label || 'Home';
        $rootScope.overview_nav_label = config.overview_nav_label || 'Overview';
        $rootScope.bulk_nav_label = config.bulk_nav_label || 'Bulk Review';
        $rootScope.bulk_nav_url = '#/'; // start w/ redirect to Overview; BulkCtrl will set as needed
        $rootScope.detail_nav_label = config.detail_nav_label || 'Detail Review';
        $rootScope.detail_nav_url = '#/'; // start w/ redirect to Overview ; DetailCtrl will set as needed
    }
]);

dataReviewApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/overview', {templateUrl: 'partials/overview.html', controller: 'OverviewCtrl'});
        $routeProvider.when('/detail', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl'});
        $routeProvider.when('/detail/:key', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl'});
        $routeProvider.when('/detail/:key/:id', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl'});
        $routeProvider.when('/bulk', {templateUrl: 'partials/bulk.html', controller: 'BulkCtrl'});
        $routeProvider.when('/bulk/:key', {templateUrl: 'partials/bulk.html', controller: 'BulkCtrl'});
        $routeProvider.when('/bulk/:key/:type', {templateUrl: 'partials/bulk.html', controller: 'BulkCtrl'});
        $routeProvider.when('/bulk/:key/:type/:id', {templateUrl: 'partials/bulk.html', controller: 'BulkCtrl'});
        $routeProvider.otherwise({redirectTo: '/overview'});
    }
]);
