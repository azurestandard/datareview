'use strict';

// Declare app level module which depends on filters, and services
var dataReviewApp = angular.module('dataReview', [
    'config',
    'endpointFetcher',
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
        $rootScope.individual_nav_label = config.individual_nav_label || 'Individual Review';
    }
]);

dataReviewApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/overview', {templateUrl: 'partials/overview.html', controller: 'OverviewCtrl'});
        $routeProvider.when('/individual', {templateUrl: 'partials/individual.html', controller: 'IndividualCtrl'});
        $routeProvider.when('/individual/:key', {templateUrl: 'partials/individual.html', controller: 'IndividualCtrl'});
        $routeProvider.when('/individual/:key/:id', {templateUrl: 'partials/individual.html', controller: 'IndividualCtrl'});
        $routeProvider.when('/bulk', {templateUrl: 'partials/bulk.html', controller: 'BulkCtrl'});
        $routeProvider.when('/bulk/:key', {templateUrl: 'partials/bulk.html', controller: 'BulkCtrl'});
        $routeProvider.when('/bulk/:key/:type', {templateUrl: 'partials/bulk.html', controller: 'BulkCtrl'});
        $routeProvider.when('/bulk/:key/:type/:id', {templateUrl: 'partials/bulk.html', controller: 'BulkCtrl'});
        $routeProvider.otherwise({redirectTo: '/overview'});
    }
]);
