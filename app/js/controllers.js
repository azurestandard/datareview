'use strict';

/* Controllers */

var dataReviewControllers = angular.module('dataReview.controllers', []);

dataReviewControllers.controller('BulkCtrl', ['$scope', 'config',
    function($scope, config) {
        $scope.bulk_label = config.bulk_label || 'Bulk Review';
    }
]);

dataReviewControllers.controller('OverviewCtrl', ['$scope', '$rootScope', '$location', '$route', 'config', 'jsFetcher',
    function($scope, $rootScope, $location, $route, config, jsFetcher) {

        $scope.fetch_the_rest = function (callback_fn) {
            console.log('fetch_the_rest $scope.endpoint:', $scope.endpoint);
            // test fn from each js file we're expecting
            if ($scope.endpoint) {
                if (!$scope.endpoint.fetched) {
                    console.log('fetch_the_rest load js files');
                    // fetch the rest of the remote config files
                    // (the one we alredy have will come from browser cache)
                    jsFetcher.fetch($scope.endpoint, $scope.refresh, callback_fn);
                }
            }
        }

        $scope.set_defaults = function () {
            $scope.overview_label = config.overview_label || 'Overview';
            $scope.default_text = config.default_text || 'List of items available for reviewing:';
            $scope.endpoints = config.endpoints;
            $scope.endpoint_index = -1;
        }

        $scope.refresh = function (callback_fn) {
            $scope.set_defaults();

            if (callback_fn) {
                callback_fn();
            }
        }

        $scope.switch_locations = function(dont_apply) {
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
                $scope.switch_locations(true);
            } else {
                $scope.fetch_the_rest($scope.switch_locations);
            }
        }

        $scope.refresh();
    }
]);

dataReviewControllers.controller('IndividualCtrl', ['$scope', '$filter', '$resource', '$routeParams', 'config', 'jsFetcher',
    function($scope, $filter, $resource, $routeParams, config, jsFetcher) {
        console.log('config:', config);

        $scope.fetch_endpoint =function () {
            if ($scope.endpoint) {
                if ($scope.endpoint.individual_label) {
                    $scope.individual_label = $scope.endpoint.individual_label;
                }

                $scope.clear_results = config.clear_results_fn;
                $scope.display_results = config.display_results_fn;
                $scope.get_parsing_rules = config.get_parsing_rules_fn;

                $scope.clear_results($scope);

                var Endpoint = $resource($scope.endpoint.url);

                $scope.details = Endpoint.get({id: $scope.id}, function () {
                    $scope.left_side = $scope.details.description;
                    $scope.right_side = '';
                    $scope.parsed_text = '';

                    $scope.parse_text($scope.details.description);
                    $scope.display_results($scope);
                });

                //todo: need to dedup text_groups (after the fact is fine,
                //      since it is better to have too much than not enough and
                //      user code may or may not have taken care of it)
                $scope.text_groups = [];

                $scope.parsing_rules = $scope.get_parsing_rules();
            } else {
                console.log('else');
                // todo: alert user that no key, id and/or endpoint available
            }
        }

        $scope.fetch_the_rest = function () {
            if ($scope.endpoint) {
                // test fn from each js file we're expecting
                if ($scope.endpoint.fetched) {
                    // we have what we need, so let's get going already
                    $scope.fetch_endpoint();
                } else {
                    // fetch the rest of the remote config files
                    // (the one we alredy have will come from browser cache)
                    jsFetcher.fetch($scope.endpoint, $scope.refresh, $scope.fetch_the_rest);
                }
            }
        }

        $scope.set_defaults = function () {
            // get parameters
            $scope.key = $routeParams.key;
            $scope.id = $routeParams.id;

            // set our endpoint
            $scope.endpoint = _.find(config.endpoints, function (endpoint) {
                if ($scope.key == endpoint.key) {
                    return true;
                }
            });

            // get config options
            $scope.individual_label = ($scope.endpoint) ? $scope.endpoint.individual_label : 'Individual Review';
        }

        $scope.refresh = function (callback_fn) {
            $scope.set_defaults();

            if (callback_fn) {
                callback_fn();
            } else {
                $scope.fetch_the_rest();
            }
        }

        // supporting functions
        $scope.parse_text = function (text) {
            var filtered_text = $filter('htmlToPlaintext')(text, true);
            var simple_text_groups = filtered_text.split('\n');
            var keys = $scope.parsing_rules['keys'];
            var curr_group = ($scope.parsing_rules['initial_group'] || $scope.parsing_rules['default_group']);

            _.each(simple_text_groups, function(text, index, list) {
                if (text) {
                    var add_it = true;
                    var dont_use_matchedKey = false;
                    if (keys) {
                        var matched_key = _.find(keys, function(start_key, index, list) {
                            var matched = text.match(start_key.regex);
                            if (matched) {
                                if (start_key.handling_fn) {
                                    var results = start_key.handling_fn($scope.text_groups,
                                                                        curr_group,
                                                                        matched);
                                    add_it = results.add_it
                                    if (results.new_group) {
                                        curr_group = results.new_group;
                                        dont_use_matchedKey = true;
                                    }
                                    if (results.text) {
                                        text = results.text
                                    }
                                }
                            }
                            return matched;
                        });

                        if (!dont_use_matchedKey &&
                             matched_key) {
                            curr_group = matched_key;
                        } else {
                            if (!curr_group.continues) {
                                curr_group = $scope.parsing_rules['default_group'];
                            }
                        }
                    }

                    if (add_it &&
                        text.trim().length > 0) {
                        $scope.text_groups.push({
                            'group': curr_group.group,
                            'text': text
                        });
                    }
                }
            });
        }

        $scope.refresh();
    }
]);
