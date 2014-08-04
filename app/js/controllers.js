'use strict';

/* Controllers */

var dataReviewControllers = angular.module('dataReview.controllers', []);

dataReviewControllers.controller('BulkCtrl', ['$scope', '$filter', 'config', 'endpointFetcher',
    function($scope, $filter, config, endpointFetcher) {

        var endpoint_handling = function (endpoint, details) {
            if (!endpoint.bulk_handling_fn) {
                endpoint.bulk_handling_fn = handle_endpoint_bulk;
            }

            endpoint.bulk_handling_fn($scope, $filter, details);
        }

        var refresh = function () {
            endpointFetcher.set_defaults($scope);

            if ($scope.endpoint) {
                $scope.bulk_label = ($scope.endpoint.bulk_label) ? $scope.endpoint.bulk_label : 'Bulk Review';
            }

            endpointFetcher.fetch_the_rest($scope, refresh, endpoint_handling)
        }

        refresh();
    }
]);

dataReviewControllers.controller('OverviewCtrl', ['$scope', '$rootScope', '$location', '$route', 'config', 'jsFetcher',
    function($scope, $rootScope, $location, $route, config, jsFetcher) {

        var reset_defaults = function () {
            $scope.overview_label = config.overview_label || 'Overview';
            $scope.default_text = config.default_text || 'List of items available for reviewing:';
            $scope.endpoints = config.endpoints;
            $scope.endpoint_index = -1;
        }

        var switch_locations = function(dont_apply) {
            reset_defaults();

            $scope.endpoint.action = $scope.endpoint
                                           .action
                                           .replace(/:key/gi, $scope.endpoint.key)
                                           .replace(/:type/gi, $scope.endpoint.default_type);

            if (dont_apply) {
                $location.path($scope.endpoint.action);
            } else {
                $scope.$apply(function() {
                    $location.path($scope.endpoint.action);
                });
            }
        }

        $scope.endpoint_selected = function (index) {
            $scope.endpoint = config.endpoints[index];

            if ($scope.endpoint.fetched) {
                switch_locations(true);
            } else {
                jsFetcher.fetch($scope.endpoint, switch_locations);
            }
        }

        reset_defaults();
    }
]);

dataReviewControllers.controller('IndividualCtrl', ['$scope', '$filter', 'config', 'endpointFetcher',
    function($scope, $filter, config, endpointFetcher) {

        var endpoint_handling = function (endpoint, details) {
            if (!endpoint.individual_handling_fn) {
                endpoint.individual_handling_fn = handle_endpoint_individual;
            }

            endpoint.individual_handling_fn($scope, $filter, details);
        }

        var refresh = function () {
            endpointFetcher.set_defaults($scope);

            if ($scope.endpoint) {
                $scope.individual_label = ($scope.endpoint.individual_label) ? $scope.endpoint.individual_label : 'Individual Review';
            }

            endpointFetcher.fetch_the_rest($scope, refresh, endpoint_handling)
        }

        refresh();
    }
]);
