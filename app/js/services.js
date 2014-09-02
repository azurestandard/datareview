'use strict';

/* Services */

var dataReviewServices = angular.module('dataReview.services', []);

dataReviewServices.
    factory('dataReviewServices', ['config',
        function (config) {
            var items = [];
            var num_items_done = 0;
            var search_info = {}
            var selected_name = '';
            var selected_bulk_id = -1;
            var selected_detail_id = -1;
            var total_items = 0;
            var type = '';

            return {
                get_items: function () {
                    return items;
                },
                get_num_items_done: function () {
                    return num_items_done;
                },
                get_search_info: function () {
                    return search_info;
                },
                get_selected_bulk_id: function () {
                    return selected_bulk_id;
                },
                get_selected_detail_id: function () {
                    return selected_detail_id;
                },
                get_selected_name: function () {
                    return selected_name;
                },
                get_total_items: function () {
                    return total_items;
                },
                get_type: function () {
                    return type;
                },
                set_items: function (new_items) {
                    items = new_items;
                },
                set_num_items_done: function (num) {
                    num_items_done = num;
                },
                set_search_info: function (srch_info) {
                    search_info = srch_info
                },
                set_selected_bulk_id: function (id) {
                    selected_bulk_id = id;
                },
                set_selected_detail_id: function (id) {
                    selected_detail_id = id;
                },
                set_selected_name: function (new_name) {
                    selected_name = new_name;
                },
                set_total_items: function (num) {
                    total_items = num;
                },
                set_type: function (new_type) {
                    type = new_type;
                }
            }
        }
    ]);


var es_client = angular.module('es_client', []);

es_client.service('es_client', function (config, esFactory) {
    return esFactory({
        host: config.search.base_url,
        apiVersion: '1.3' //,
        // log: 'trace'
    })
});


var es = angular.module('es', []);

es.
    factory('es', ['config', 'es_client',
        function (config, es_client) {
            var _client = es_client;
            var _index = config.search.index;
            var _type = undefined;          // must be set via set_type()

            var es = {
                client: function() {
                    return _client;
                },
                count: function (body, callback_fn) {
                    _client.count({
                        index: _index,
                        type: _type,
                        body: body
                    }, function (error, response) {
                        if (callback_fn) {
                            callback_fn(error, response);
                        }
                    });
                },
                get: function (id, callback_fn) {
                    _client.get({
                        index: _index,
                        type: _type,
                        id: id
                    }, function (error, response) {
                        if (callback_fn) {
                            callback_fn(error, response);
                        }
                    });
                },
                get_type: function () {
                    return _type;
                },
                index: function (id, body, callback_fn) {
                    _client.index({
                        index: _index,
                        type: _type,
                        id: id,
                        refresh: true,
                        body: body
                    }, function (error, response) {
                        if (callback_fn) {
                            callback_fn(error, response);
                        }
                    });
                },
                ping: function () {
                    _client.ping({
                        requestTimeout: 1000,
                        // undocumented params are appended to the query string
                        hello: "elasticsearch!"
                    }, function (error) {
                        if (error) {
                            console.error('elasticsearch cluster is down!');
                        } else {
                            console.log('All is well');
                        }
                    });
                },
                search: function (body, callback_fn, from, size, sort, q) {
                    _client.search({
                        index: _index,
                        type: _type,
                        from: (from >= 0) ? from : undefined,
                        size: (size) ? size : undefined,
                        sort: (sort) ? sort : undefined,
                        q: (q) ? q : undefined,
                        body: (body) ? body : undefined
                    },
                    function(error, response) {
                        if (callback_fn) {
                            callback_fn(error, response);
                        }
                    });
                },
                set_type: function (type) {
                    _type = type;
                },
                update: function (id, body, callback_fn) {
                    _client.update({
                        index: _index,
                        type: _type,
                        id: id,
                        refresh: true,
                        body: body
                    }, function (error, response) {
                        if (callback_fn) {
                            callback_fn(error, response);
                        }
                    });
                }
            }

            return es;
        }
    ]);


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
    factory('endpointFetcher', ['$location', '$resource', '$route', '$routeParams', 'config', 'jsFetcher',
        function ($location, $resource, $route, $routeParams, config, jsFetcher) {
            return {
                fetch_endpoint: function ($scope, prefetch_callback_fn, postfetch_callback_fn) {
                    if ($scope.endpoint) {
                        $scope.endpoint_url = $scope.endpoint_url
                                                    .replace(/:key/, $scope.key)
                                                    .replace(/:type/, $scope.type)
                                                    .replace(/:id/, $scope.id);

                        if (prefetch_callback_fn) {
                            prefetch_callback_fn($scope.endpoint);
                        }

                        var Endpoint = $resource($scope.endpoint_url);

                        $scope.details = Endpoint.get({}, function() {
                            if (postfetch_callback_fn) {
                                postfetch_callback_fn($scope.endpoint, $scope.details);
                            }
                        });
                    } else {
                        console.log('else');
                        // todo: alert user that no key, id and/or endpoint available
                    }
                },
                fetch_the_rest: function ($scope, fetch_handling_fn, endpoint_handling_prefetch_fn, endpoint_handling_fn) {
                    if ($scope.endpoint &&
                        $scope.endpoint.fetched) {
                        // we have what we need, so let's get going already
                        this.fetch_endpoint($scope, endpoint_handling_prefetch_fn, endpoint_handling_fn);
                    } else {
                        // fetch the rest of the remote config files
                        // (the one we already have will come from browser cache)
                        jsFetcher.fetch($scope.endpoint, fetch_handling_fn);
                    }
                },
                set_defaults: function ($scope, action_key) {
                    // action_key let's us know which action to go after
                    $scope.action_key = action_key;

                    // get parameters
                    $scope.key = $routeParams.key;
                    $scope.type = $routeParams.type;
                    $scope.id = $routeParams.id;

                    // set our endpoint
                    $scope.endpoint = _.find(config.endpoints, function (endpoint) {
                        if ($scope.type) {
                            if ($scope.key == endpoint.key &&
                                $scope.type == endpoint.default_type) {
                                return true;
                            }
                        } else {
                            // fallback to just checking the key ...
                            if ($scope.key == endpoint.key) {
                                return true;
                            }
                        }
                    });

                    if ($scope.endpoint) {
                        // endpoint_url is what fetch will go after ...
                        var have_url = false;

                        if ($scope.id) {
                            switch (action_key) {
                                case 'bulk':
                                    $scope.endpoint_url = $scope.endpoint.bulk_id_url
                                    have_url = true;
                                    break;
                                // case 'individual':
                                //     $scope.endpoint_url = $scope.endpoint.individual_id_url
                                //     break;
                            }
                        }

                        if (!have_url) {
                            switch (action_key) {
                                case 'bulk':
                                    $scope.endpoint_url = $scope.endpoint.bulk_url
                                    break;
                                case 'individual':
                                    $scope.endpoint_url = $scope.endpoint.individual_url
                                    break;
                            }
                        }
                    }
                }
            }
        }
    ]);
