'use strict';

/* Services */

angular.module('myApp.services', []).
  value('version', '0.1').  // application version
  value('beehive_url', 'https://beehive.azurestandard.com/').
  value('elasticsearch_url', 'http://es.azurestandard.com:9200/').
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
  ).
  service(
    'QueueClient',
    [
      'elasticsearch_url',
      'esFactory',
      function (elasticsearch_url, esFactory) {
        return esFactory({
          host: elasticsearch_url,
          apiVersion: "1.3",
          //log: 'trace',
        });
      }
    ]
  ).
  factory(
    'setup_index',
    [
      '$q',
      'PieceMeta',
      'QueueClient',
      'esFactory',
      function ($q, PieceMeta, QueueClient, esFactory) {
        var _piece_meta_query_factory = function(from, size) {
          return function(result) {
            return PieceMeta.query({from: from, size: size}).$promise;
          };
        }

        return function() {
          QueueClient.indices.create({
            index: 'description_queue',
            body: {
              mappings: {
                piece_meta: {
                  properties: {
                    id: {
                      type: 'integer',
                      store: true,
                      norms: {enabled: false},
                    },
                    name: {
                      type: 'string',
                      store: true,
                    },
                    brand: {
                      type: 'integer',
                      store: true,
                      norms: {enabled: false},
                    },
                    editor: {
                      type: 'string',
                      store: true,
                      index: 'not_analyzed',
                    },
                    claimed: {type: 'date'},
                    finished: {type: 'date'},
                  },
                },
              },
            },
          }).then(function(response) {
            return PieceMeta.count().$promise;
          }).then(function(response) {
            var count = response.count;
            var size = 10;
            var promise = $q.when(null);
            for (var from = 0; from < count; from += size) {
              promise = promise.then(
                _piece_meta_query_factory(from, size)
              ).then(function(response) {
                var promises = [];
                  for (var i = 0; i < response.length; i++) {
                  var piece_meta = response[i];
                  promises.push(QueueClient.create({
                    index: 'description_queue',
                    type: 'piece_meta',
                    body: {
                      id: piece_meta.id,
                      name: piece_meta.name,
                      brand: piece_meta.brand,
                    },
                  }));
                }
                return $q.all(promises);
              });
            }
            return promise;
          }).catch(function(error) {
            console.log(error);
          });
        };
      }
    ]
  ).
  factory(
    'username',
    [
      '$http',
      'beehive_url',
      function($http, beehive_url) {
        return $http.get(
          beehive_url + 'beekeeper/me',
          {
            headers: {
              'Accept': 'application/json',
            },
            withCredentials: true,
          }
        );
      }
    ]
  );
