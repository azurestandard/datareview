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
                               .replace(/&amp;/gm, '&')    // replace &amp; with &
                               .replace(/&lt;/gm, '<')     // replace &lt; with <
                               .replace(/&gt;/gm, '>')     // replace &gt; with >
                               .replace(/&nbsp;/gm, ' ')   // replace non-breaking space with space
                               .replace(/&apost;/gm, "'")   // replace apostrophe with '
                               .replace(/&quot;/gm, '"')   // replace double-quote with "
                               .replace(/<[^>]+>/gm, '');  // replace remaining html tags
        }
    }
]);
