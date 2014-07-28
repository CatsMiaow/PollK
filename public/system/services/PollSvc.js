'use strict';

define(['services/_services'], function(services) {

    services.factory('Poll', ['Resource', '$route', '$q',
        function(Resource, $route, $q) {
            var poll = {};

            poll.conn = Resource('poll/:pollId/:option', {
                pollId: '@pollId',
                option: '@option'
            });

            poll.list = function(param) {
                var delay = $q.defer();

                var config = {
                    count : true, // or null;
                    limit : 20,
                    page  : 1,
                    search: {}
                };

                angular.extend(config, param);

                // offset 계산
                config.offset = (config.page - 1) * config.limit;

                poll.conn.query(config, function(polls) {
                    delay.resolve(polls);
                }, function() {
                    delay.reject('Execution Error');
                });

                return delay.promise;
            }

            poll.get = function(pollId, isCount, ticket) {
                var delay = $q.defer();

                pollId = $route.current.params.pollId || pollId;

                poll.conn.get({
                    pollId : pollId,
                    isCount: isCount,
                    ticket : ticket
                }, function(poll) {
                    delay.resolve(poll);
                }, function() {
                    delay.reject('Execution Error: ' + pollId);
                });

                return delay.promise;
            }

            poll.ticketing = function() {
                var delay = $q.defer();

                poll.conn.update({
                    pollId: $route.current.params.pollId,
                    option: 'ticketing'
                }, function(ticket) {
                    delay.resolve(ticket);
                }, function() {
                    delay.reject('Execution Error: ' + $route.current.params.pollId);
                });

                return delay.promise;
            }

            poll.step = function() {
                var delay = $q.defer();

                Resource('poll/step/:ticket/:password?').get({
                    ticket: $route.current.params.ticket,
                    password: $route.current.params.password
                }, function(poll) {
                    delay.resolve(poll);
                }, function() {
                    delay.reject('Execution Error: ' + $route.current.params.ticket);
                });

                return delay.promise;
            }

            poll.result = function(replyId, isCount) {
                var delay = $q.defer();

                replyId = $route.current.params.replyId || replyId;

                Resource('poll/result/:replyId').get({
                    replyId: replyId,
                    isCount: isCount
                }, function(pollReply) {
                    delay.resolve(pollReply);
                }, function() {
                    delay.reject('Execution Error: ' + replyId);
                });

                return delay.promise;   
            }

            return poll;
        }
    ]);
});
