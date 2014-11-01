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
    'ui.tree',
    'dataReview.filters',
    'dataReview.services',
    'dataReview.directives',
    'dataReview.controllers'
]).
config(['$httpProvider', '$sceDelegateProvider',
    function($httpProvider, $sceDelegateProvider) {
        $httpProvider.defaults.headers.common.Accept = 'application/json';

        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://0.0.0.0:8000/**'
        ]);
    }
]);

dataReviewApp.run(['$rootScope', 'config',
    function($rootScope, config) {
        if (datareview_config) {
            config = datareview_config;
        }

        $rootScope.home = {
            label: (config.home && config.home.label) ? config.home.label : 'Home',
            url: (config.home && config.home.url) ? config.home.url : '#'
        }

        $rootScope.overview_nav_label = config.overview_nav_label || 'Overview';
        $rootScope.bulk_nav_label = (config.bulk && config.bulk.nav_label) ? config.bulk.nav_label : 'Bulk Review';
        $rootScope.bulk_nav_url = '#/'; // start w/ redirect to Overview; BulkCtrl will set as needed

        $rootScope.detail_nav_label = (config.detail && config.detail.nav_label) ? config.detail.nav_label : 'Detail Review';
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
