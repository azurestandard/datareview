'use strict';

/* Controllers */

var dataReviewControllers = angular.module('dataReview.controllers', []);

dataReviewControllers.controller('BulkCtrl', ['$rootScope', '$scope', '$filter', '$http', '$location', '$routeParams', 'config', 'endpointFetcher',
    function($rootScope, $scope, $filter, $http, $location, $routeParams, config, endpointFetcher) {

        $rootScope.bulk_nav_url = $location.absUrl();       // set our bulk nav link to whatever we were at last

        $scope.$filter = $filter;               // may be needed by handling.js later
        $scope.$http = $http;                   // may be needed by handling.js later
        $scope.$location = $location;           // may be needed by handling.js later
        $scope.$routeParams = $routeParams;     // may be needed by handling.js later

        function endpoint_handling_prefetch(endpoint) {
            if (!endpoint.bulk_handling_prefetch_fn) {
                endpoint.bulk_handling_prefetch_fn = handle_endpoint_bulk_prefetch;
            }

            endpoint.bulk_handling_prefetch_fn($scope, $filter);
        }

        function endpoint_handling(endpoint, details) {
            if (!endpoint.bulk_handling_fn) {
                endpoint.bulk_handling_fn = handle_endpoint_bulk;
            }

            endpoint.bulk_handling_fn($scope, $filter, details);
        }

        function refresh() {
            endpointFetcher.set_defaults($scope, 'bulk');

            if ($scope.endpoint) {
                $scope.bulk_label = ($scope.endpoint.bulk_label) ? $scope.endpoint.bulk_label : 'Bulk Review';
                $scope.bulk_text = ($scope.endpoint.bulk_text) ? $scope.endpoint.bulk_text : '';
            }

            endpointFetcher.fetch_the_rest($scope, refresh, endpoint_handling_prefetch, endpoint_handling);
        }

        refresh();
    }
]);

dataReviewControllers.controller('OverviewCtrl', ['$scope', '$rootScope', '$location', '$route', 'config', 'jsFetcher',
    function($scope, $rootScope, $location, $route, config, jsFetcher) {

        function reset_defaults() {
            $scope.overview_label = config.overview_label || 'Overview';
            $scope.default_text = config.default_text || 'List of items available for reviewing:';
            $scope.endpoints = config.endpoints;
            $scope.endpoint_index = -1;
        }

        function switch_locations() {
            reset_defaults();

            $scope.endpoint.initial_action = $scope.endpoint
                                                   .initial_action
                                                   .replace(/:key/gi, $scope.endpoint.key)
                                                   .replace(/:type/gi, $scope.endpoint.default_type);

            if ($scope.$$phase) {
                // todo: see if ^this check can be removed
                $location.path($scope.endpoint.initial_action);
            } else {
                $scope.$apply(function() {
                    $location.path($scope.endpoint.initial_action);
                });
            }
        }

        $scope.endpoint_selected = function (index) {
            $scope.endpoint = config.endpoints[index];

            if ($scope.endpoint.fetched) {
                switch_locations();
            } else {
                jsFetcher.fetch($scope.endpoint, switch_locations);
            }
        }

        reset_defaults();
    }
]);

dataReviewControllers.controller('IndividualCtrl', ['$rootScope', '$scope', '$filter', '$http', '$location', '$routeParams', 'config', 'endpointFetcher',
     function($rootScope, $scope, $filter, $http, $location, $routeParams, config, endpointFetcher) {

        $rootScope.individual_nav_url = $location.absUrl();       // set our bulk nav link to whatever we were at last

        $scope.$filter = $filter;               // may be needed by handling.js later
        $scope.$http = $http;                   // may be needed by handling.js later
        $scope.$location = $location;           // may be needed by handling.js later
        $scope.$routeParams = $routeParams;     // may be needed by handling.js later

        function endpoint_handling_prefetch(endpoint) {
            if (!endpoint.individual_handling_prefetch_fn) {
                endpoint.individual_handling_prefetch_fn = handle_endpoint_individual_prefetch;
            }

            endpoint.individual_handling_prefetch_fn($scope, $filter);
        }

        function endpoint_handling(endpoint, details) {
            if (!endpoint.individual_handling_fn) {
                endpoint.individual_handling_fn = handle_endpoint_individual;
            }

            endpoint.individual_handling_fn($scope, $filter, details);
        }

        function refresh() {
            $scope.individual_text = config.individual_text || '';

            endpointFetcher.set_defaults($scope, 'individual');

            if ($scope.endpoint) {
                $scope.individual_label = ($scope.endpoint.individual_label) ? $scope.endpoint.individual_label : 'Individual Review';
                $scope.individual_text = ($scope.endpoint.individual_text) ? $scope.endpoint.individual_text : '';
            }

            endpointFetcher.fetch_the_rest($scope, refresh, endpoint_handling_prefetch, endpoint_handling);
        }

        refresh();
    }
]);
