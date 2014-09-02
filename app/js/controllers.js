'use strict';

/* Controllers */

var dataReviewControllers = angular.module('dataReview.controllers', []);

dataReviewControllers.controller('BulkCtrl', [
    '$rootScope', '$scope', '$filter', '$http', '$location', '$routeParams',
    'config', 'dataReviewServices', 'es', 'es_client', 'esFactory', 'endpointFetcher',
    function($rootScope, $scope, $filter, $http, $location, $routeParams,
             config, dataReviewServices, es, es_client, esFactory, endpointFetcher) {
        $scope.es = es;

        // set our bulk nav link to whatever we were at last
        $rootScope.bulk_nav_url = $location.absUrl();

        // reset, since we can't know whether an item is part of the bulk list or not ...
        $rootScope.detail_nav_url = $rootScope.bulk_nav_url;

        $scope.bulk_id = dataReviewServices.get_selected_bulk_id();
        $scope.selected_name = dataReviewServices.get_selected_name();

        dataReviewServices.set_type($routeParams.type);

        $scope.user = dataReviewServices.get_user(function (_user) {
            $scope.user = _user;
        });

        // may be needed by handling.js later ...
        $scope.dataReviewServices = dataReviewServices;
        $scope.$filter = $filter;
        $scope.$http = $http;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;

        function endpoint_handling_prefetch(endpoint) {
            if (!endpoint.bulk.handling_prefetch_fn) {
                endpoint.bulk.handling_prefetch_fn = handle_endpoint_bulk_prefetch;
            }

            $scope.match_all = endpoint.match_all;
            $scope.short_label = endpoint.short_label;

            endpoint.bulk.handling_prefetch_fn($scope, $filter);
        }

        $scope.endpoint_handling = function (endpoint, details) {
            if (!endpoint.bulk.handling_fn) {
                endpoint.bulk.handling_fn = handle_endpoint_bulk;
            }

            $scope.es.set_type(endpoint.key);

            endpoint.bulk.handling_fn($scope, $filter, details);
        }

        function refresh() {
            endpointFetcher.set_defaults($scope, 'bulk');

            if ($scope.endpoint) {
                $scope.bulk_label = ($scope.endpoint.bulk.label) ? $scope.endpoint.bulk.label : 'Bulk Review';
                $scope.bulk_text = ($scope.endpoint.bulk.text) ? $scope.endpoint.bulk.text : '';
            }

            endpointFetcher.fetch_the_rest($scope, refresh, endpoint_handling_prefetch, $scope.endpoint_handling);
        }

        refresh();
    }
]);

dataReviewControllers.controller('OverviewCtrl', [
    '$scope', '$rootScope', '$location', '$route', 'config', 'dataReviewServices', 'es', 'es_client', 'esFactory', 'jsFetcher',
    function($scope, $rootScope, $location, $route, config, dataReviewServices, es, es_client, esFactory, jsFetcher) {
        $scope.es = es;

        $scope.bulk_id = dataReviewServices.get_selected_bulk_id();
        $scope.selected_name = dataReviewServices.get_selected_name();

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
    '$rootScope', '$scope', '$filter', '$http', '$location', '$q', '$route', '$routeParams', '$timeout',
    'config', 'dataReviewServices', 'es', 'es_client', 'esFactory', 'endpointFetcher',
    function($rootScope, $scope, $filter, $http, $location, $q, $route, $routeParams, $timeout,
             config, dataReviewServices, es, es_client, esFactory, endpointFetcher) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if (current.scope.is_editing &&
                current.scope.cancel_edit) {
                // derived from http://stackoverflow.com/a/18245378 as accessed 9/2/2014 10:29 am CDT
                next.resolve = angular.extend(next.resolve || {}, {
                    cancel_edit: function () {
                        return current.scope.cancel_edit(current.scope);
                    }
                });
            }
        });

        $scope.set_current_index = function () {
            var search_info = dataReviewServices.get_search_info();

            if ($scope.items) {
                for (var i=0; i < $scope.items.length; i++) {
                    var item = $scope.items[i];

                    if (item.id == $scope.detail_id) {
                        $scope.current_index = search_info.from + i + 1;
                        break;
                    }
                }
            }
        }

        $scope.page_changed = function () {
            var search_info = dataReviewServices.get_search_info();

            if (search_info) {
                if ($scope.is_editing) {
                    $scope.cancel_edit($scope);
                }

                var start_index = (search_info.page - 1) * search_info.pageSize;

                if ($scope.current_index - start_index == 0) {
                    // get previous set of items
                    fetch_search_set(search_info, false);
                } else {
                    if (search_info) {
                        if ($scope.current_index - start_index > search_info.pageSize) {
                            // get next set of items ...
                            fetch_search_set(search_info, true);
                        } else {
                            nav_to_new_item(search_info.pageSize);
                        }
                    }
                }
            }
        };

        $scope.set_percent_done = function () {
            $scope.percent_done = $scope.num_items_done / $scope.total_items * 100;

            if ($scope.percent_done < 25) {
                $scope.done_level = 'danger';
            } else if ($scope.percent_done < 50) {
                $scope.done_level = 'warning';
            } else if ($scope.percent_done < 75) {
                $scope.done_level = 'info';
            } else {
                $scope.done_level = 'success';
            }
        }

        $scope.update_reviewed_status = function (details) {
            if (details &&
                details.reviewedAt) {
                $scope.is_reviewed = true;
                $scope.reviewed_by = details.reviewedBy;
                $scope.reviewed_at = details.reviewedAt.replace("T", " ").substr(0,19);
            }

            if ($scope.is_reviewed) {
                var reviewed_tooltip = 'Reviewed';

                if ($scope.reviewed_by) {
                    reviewed_tooltip += ' by ' + $scope.reviewed_by;
                }

                if ($scope.reviewed_at) {
                    reviewed_tooltip += ' on ' + $scope.reviewed_at;
                }

                reviewed_tooltip += '.';

                $scope.reviewed_tooltip = reviewed_tooltip;
            } else {
                $scope.is_reviewed = false;
                $scope.reviewed_by = undefined;
                $scope.reviewed_at = undefined;
            }
        }

        $scope.es = es;

        $scope.bulk_id = dataReviewServices.get_selected_bulk_id();
        $scope.detail_id = dataReviewServices.get_selected_detail_id() || $routeParams.id;
        $scope.items = dataReviewServices.get_items();
        $scope.media_base_url = config.media_base_url;
        $scope.selected_name = dataReviewServices.get_selected_name();
        $scope.num_items_done = dataReviewServices.get_num_items_done();
        $scope.total_items = dataReviewServices.get_total_items();

        $scope.set_current_index();
        $scope.set_percent_done();

        $scope.type = dataReviewServices.get_type();

        $scope.user = dataReviewServices.get_user(function (_user) {
            $scope.user = _user;
        });

        $scope.dataReviewServices = dataReviewServices;

        // set our detail nav link to whatever we were at last
        $rootScope.detail_nav_url = $location.absUrl();

        var search_info = dataReviewServices.get_search_info();

        // may be needed by handling.js later ...
        $scope.$filter = $filter;
        $scope.$http = $http;
        $scope.$location = $location;
        $scope.$q = $q;
        $scope.$route = $route;
        $scope.$routeParams = $routeParams;
        $scope.$rootScope = $rootScope;
        $scope.$timeout = $timeout;

        function endpoint_handling_prefetch(endpoint) {
            if (!endpoint.detail.handling_prefetch_fn) {
                endpoint.detail.handling_prefetch_fn = handle_endpoint_detail_prefetch;
            }

            $scope.match_all = endpoint.match_all;
            $scope.short_label = endpoint.short_label;

            endpoint.detail.handling_prefetch_fn($scope, $filter);
        }

        $scope.endpoint_handling = function (endpoint, details) {
            if (!endpoint.detail.handling_fn) {
                endpoint.detail.handling_fn = handle_endpoint_detail;
            }

            $scope.detail_display_name = endpoint.detail.display_name;

            $scope.es.set_type(endpoint.key);

            endpoint.detail.handling_fn($scope, $filter, details);
        }

        function fetch_search_set (search_info, going_forward) {
            var from = search_info.from;
            var page_size = search_info.pageSize;
            var new_from = 0;

            if (going_forward) {
                new_from = from + page_size;
            } else {
                new_from = from - page_size;
            }

            if (new_from < 0) {
                new_from = 0;
            }

            if (new_from > $scope.total_items) {
                new_from = (Math.ceil($scope.total_items / page_size) - 1) * page_size;
            }

            search_info.from = new_from;
            search_info.page = new_from / page_size + 1;

            scope.dataReviewServices.set_search_info(search_info);

            if (search_info) {
                $scope.es.search({
                    query: search_info.query,
                    fields: []  // only need _ids
                }, function (error, response) {
                    if ($scope) {
                        var new_items = response.hits.hits;

                        _.each(new_items, function(item, index, list) {
                            if (item._id) {
                                item.id = item._id;
                                delete item._id;
                            }
                        });

                        $scope.items = new_items;

                        nav_to_new_item(page_size);
                    }
                }, new_from, page_size, search_info.sortField, search_info.sortOrder, search_info.filteredText);
            }
        }

        function nav_to_new_item (page_size) {
            var search_info = dataReviewServices.get_search_info(search_info);

            $scope.current_page = Math.ceil($scope.current_index / page_size);

            var start_index = ($scope.current_page - 1) * page_size;
            var i = $scope.current_index - start_index - 1;
            var item = $scope.items[i];

            dataReviewServices.set_items($scope.items);
            dataReviewServices.set_selected_detail_id(item.id);
            dataReviewServices.set_total_items($scope.total_items);

            var last_slash_pos = $location.url().lastIndexOf("/");
            var new_url = $location.url().substr(0, last_slash_pos + 1) + item.id;

            $location.path(new_url);
        }

        function refresh() {
            $scope.detail_text = (config.detail && config.detail.text) ? config.detail.text : '';

            endpointFetcher.set_defaults($scope, 'detail');

            if ($scope.endpoint) {
                $scope.detail_label = ($scope.endpoint.detail.label) ? $scope.endpoint.detail.label : 'Detail Review';
                $scope.detail_text = ($scope.endpoint.detail.text) ? $scope.endpoint.detail.text : '';

                if (!$scope.type) {
                    dataReviewServices.set_type($scope.endpoint.default_type);

                    $scope.type = dataReviewServices.get_type();
                }

                set_display_type();
            }

            endpointFetcher.fetch_the_rest($scope, refresh, endpoint_handling_prefetch, $scope.endpoint_handling);
        }

        function set_display_type () {
            if ($scope.total_items == 0) {
                if ($scope.endpoint.detail.display_type) {
                    $scope.display_type = ' ' + $scope.endpoint.detail.display_type.singular;
                } else {
                    $scope.display_type = ' item';
                }
            } else {
                if ($scope.endpoint.detail.display_type) {
                    $scope.display_type = ' ' + $scope.endpoint.detail.display_type.plural;
                } else {
                    $scope.display_type = ' items';
                }
            }
        }

        refresh();
    }
]);
