'use strict';

/* Controllers */

var dataReviewControllers = angular.module('dataReview.controllers', []);

dataReviewControllers.controller('BulkCtrl', [
    '$rootScope', '$scope', '$filter', '$http', '$location', '$routeParams',
    'config', 'dataReviewServices', 'endpointFetcher',
    function($rootScope, $scope, $filter, $http, $location, $routeParams,
             config, dataReviewServices, endpointFetcher) {
        $rootScope.bulk_nav_url = $location.absUrl();       // set our bulk nav link to whatever we were at last

        $scope.user = dataReviewServices.get_user(function (_user) {
            $scope.user = _user;
        });

        // may be needed by handling.js later ...
        $scope.dataReviewServices = dataReviewServices;
        $scope.$filter = $filter;               // may be needed by handling.js later
        $scope.$http = $http;                   // may be needed by handling.js later
        $scope.$location = $location;           // may be needed by handling.js later
        $scope.$routeParams = $routeParams;     // may be needed by handling.js later

        function endpoint_handling_prefetch(endpoint) {
            if (!endpoint.bulk.handling_prefetch_fn) {
                endpoint.bulk.handling_prefetch_fn = handle_endpoint_bulk_prefetch;
            }

            endpoint.bulk.handling_prefetch_fn($scope, $filter);
        }

        $scope.endpoint_handling = function (endpoint, details) {
            if (!endpoint.bulk.handling_fn) {
                endpoint.bulk.handling_fn = handle_endpoint_bulk;
            }

            endpoint.bulk.handling_fn($scope, $filter, details);
        }

        function refresh() {
            endpointFetcher.set_defaults($scope, 'bulk');

            if ($scope.endpoint) {
                $scope.bulk_label = ($scope.endpoint.bulk.label) ? $scope.endpoint.bulk.label : 'Bulk Review';
                $scope.bulk_text = ($scope.endpoint.bulk.text) ? $scope.endpoint.bulk.text : '';
            }

            endpointFetcher.fetch_the_rest($scope, refresh, endpoint_handling_prefetch, endpoint_handling);
        }

        refresh();
    }
]);

dataReviewControllers.controller('OverviewCtrl', [
    '$scope', '$rootScope', '$location', '$route', 'config', 'dataReviewServices', 'jsFetcher',
    function($scope, $rootScope, $location, $route, config, dataReviewServices, jsFetcher) {

        $scope.user = dataReviewServices.get_user(function (_user) {
            $scope.user = _user;
        });

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

dataReviewControllers.controller('DetailCtrl', [
    '$rootScope', '$scope', '$filter', '$http', '$location', '$routeParams',
    'config', 'dataReviewServices', 'endpointFetcher',
    function($rootScope, $scope, $filter, $http, $location, $routeParams,
             config, dataReviewServices, endpointFetcher) {

        $rootScope.detail_nav_url = $location.absUrl();       // set our bulk nav link to whatever we were at last

        $scope.user = dataReviewServices.get_user(function (_user) {
            $scope.user = _user;
        });

        // may be needed by handling.js later ...
        $scope.dataReviewServices = dataReviewServices;
        $scope.$filter = $filter;               // may be needed by handling.js later
        $scope.$http = $http;                   // may be needed by handling.js later
        $scope.$location = $location;           // may be needed by handling.js later
        $scope.$routeParams = $routeParams;     // may be needed by handling.js later

        function endpoint_handling_prefetch(endpoint) {
            if (!endpoint.detail.handling_prefetch_fn) {
                endpoint.detail.handling_prefetch_fn = handle_endpoint_detail_prefetch;
            }

            endpoint.detail.handling_prefetch_fn($scope, $filter);
        }

        function endpoint_handling(endpoint, details) {
            if (!endpoint.detail.handling_fn) {
                endpoint.detail.handling_fn = handle_endpoint_detail;
            }

            endpoint.detail.handling_fn($scope, $filter, details);
        }

        function refresh() {
            $scope.detail_text = (config.detail && config.detail.text) ? config.detail.text : '';

            endpointFetcher.set_defaults($scope, 'detail');

            if ($scope.endpoint) {
                $scope.detail_label = ($scope.endpoint.detail.label) ? $scope.endpoint.detail.label : 'Detail Review';
                $scope.detail_text = ($scope.endpoint.detail.text) ? $scope.endpoint.detail.text : '';
            }

            endpointFetcher.fetch_the_rest($scope, refresh, endpoint_handling_prefetch, endpoint_handling);
        }

        refresh();
    }
]);
