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
        /**
         * Convert an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj) {
          var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

          for(name in obj) {
            value = obj[name];

            if(value instanceof Array) {
              for(i=0; i<value.length; ++i) {
                subValue = value[i];
                fullSubName = name + '[' + i + ']';
                innerObj = {};
                innerObj[fullSubName] = subValue;
                query += param(innerObj) + '&';
              }
            }
            else if(value instanceof Object) {
              for(subName in value) {
                subValue = value[subName];
                fullSubName = name + '[' + subName + ']';
                innerObj = {};
                innerObj[fullSubName] = subValue;
                query += param(innerObj) + '&';
              }
            }
            else if(value !== undefined && value !== null)
              query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
          }

          return query.length ? query.substr(0, query.length - 1) : query;
        };

        return $resource(
          beehive_url + 'piece/:id',
          {
            id: '@id',
          },
          {
            get: {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              withCredentials: true,
            },
            save: {
              method: 'POST',
              transformRequest: [function(data) {
                return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
              }],
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
              },
              withCredentials: true,
            },
            count: {
              method: 'GET',
              url: beehive_url + 'piece/search',
              params: {
                count: true,
              },
              headers: {
                'Accept': 'application/json',
              },
              withCredentials: true,
            },
            query: {
              method: 'GET',
              url: beehive_url + 'piece/search',
              headers: {
                'Accept': 'application/json',
              },
              withCredentials: true,
              isArray: true,
            },
          }
        );
      },
    ]
  );
