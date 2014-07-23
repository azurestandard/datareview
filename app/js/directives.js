'use strict';

/* Directives */

var dataReviewDirectives = angular.module('dataReview.directives', []);

dataReviewDirectives.directive('appVersion', ['version',
    function(version) {
        return function(scope, elem, attrs) {
            elem.text(version);
        };
    }
]);
