'use strict';

/* Services */

var dataReviewServices = angular.module('dataReview.services', []);

dataReviewServices.value('version', '0.1');

var config = angular.module('config', []);

config.
    factory('config', function() {
        return datareview_config; // defined in dev-supplied config.js; alternatively, define config here
    });

var jsFetcher = angular.module('jsFetcher', []);

jsFetcher.
    factory('jsFetcher', ['config',
        function(config) {
            return {
                fetch: function (endpoint, callback_fn) {
                    if (endpoint &&
                        endpoint.js_urls) {
                        var js_urls = [];

                        // make use of our base url if we have one
                        _.each(endpoint.js_urls, function (js_url, index, list) {
                            if (endpoint.js_base_url) {
                                js_urls.push(endpoint.js_base_url + js_url);
                            } else {
                                js_urls.push(js_url);
                            }
                        });

                        $script(js_urls, function() {
                            endpoint.fetched = true;

                            if (callback_fn) {
                                callback_fn();
                            }
                        });
                    }
                }
            }
        }
    ]);


var endpointFetcher = angular.module('endpointFetcher', []);

endpointFetcher.
    factory('endpointFetcher', ['$resource', '$routeParams', 'config', 'jsFetcher',
        function ($resource, $routeParams, config, jsFetcher) {
            return {
                fetch_endpoint: function ($scope, callback_fn) {
                    if ($scope.endpoint) {
                        $scope.endpoint.url= $scope.endpoint.url.replace(/:key/, $scope.key)
                                                                .replace(/:id/, $scope.id)
                                                                .replace(/:type/, $scope.type);

                        var Endpoint = $resource($scope.endpoint.url);

                        $scope.details = Endpoint.get({}, function() {
                            callback_fn($scope.endpoint, $scope.details);
                        });
                    } else {
                        console.log('else');
                        // todo: alert user that no key, id and/or endpoint available
                    }
                },
                fetch_the_rest: function ($scope, fetch_handling_fn, endpoint_handling_fn) {
                    if ($scope.endpoint &&
                        $scope.endpoint.fetched) {
                        // we have what we need, so let's get going already
                        this.fetch_endpoint($scope, endpoint_handling_fn);
                    } else {
                        // fetch the rest of the remote config files
                        // (the one we already have will come from browser cache)
                        jsFetcher.fetch($scope.endpoint, fetch_handling_fn);
                    }
                },
                set_defaults: function ($scope) {
                    // get parameters
                    $scope.key = $routeParams.key;
                    $scope.id = $routeParams.id;
                    $scope.type = $routeParams.type;

                    // set our endpoint
                    $scope.endpoint = _.find(config.endpoints, function (endpoint) {
                        if ($scope.key == endpoint.key) {
                            return true;
                        }
                    });
                }
            }
        }
    ]);
