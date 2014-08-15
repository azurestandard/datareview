'use strict';

/* Services */

angular.module('myApp.services', []).
  value('version', '0.1').  // application version
  value('beehive_url', 'https://beehive.azurestandard.com/').
  factory(
    'PieceMeta',
    [
      '$resource',
      'beehive_url',
      function($resource, beehive_url) {
        return $resource(
          beehive_url + 'piece/:id',
          {
            id: '@id',
          },
          {
            'query': {
              method: 'GET',
              url: beehive_url + 'piece/search',
              isArray: true,
            },
          }
        );
      },
    ]
  );
