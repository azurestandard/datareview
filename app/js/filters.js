'use strict';

/* Filters */

var dataReviewFilters = angular.module('dataReview.filters', []);

dataReviewFilters.filter('interpolate', ['version',
    function(version) {
        return function(text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    }
]);

dataReviewFilters.filter('htmlToPlaintext', [
    function() {
        return function(text) {
            // todo: need to allow for special handling of <a href>
            return String(text).replace(/<p>/gm, '\n')     // replace <p> with \n
                               .replace(/<li>/gm, '\n')    // replace <li> with \n
                               .replace(/&nbsp;/gm, ' ')   // replace non-breaking space with space
                               .replace(/<[^>]+>/gm, '');  // replace remaining html tags
        }
    }
]);
