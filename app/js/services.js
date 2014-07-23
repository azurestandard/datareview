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
                fetch: function (endpoint, refresh_fn, callback_fn) {
                    if (!endpoint.fetched &&
                         refresh_fn &&
                         endpoint.js) {
                        var js_urls = [
                            endpoint.js.parsing_rules,
                            endpoint.js.view
                        ]

                        $script(js_urls, function() {
                            endpoint.fetched = true;
                            refresh_fn(callback_fn);
                        });
                    }
                }
            }
        }
    ]);

