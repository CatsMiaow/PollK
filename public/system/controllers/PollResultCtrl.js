'use strict';

define(['controllers/_controllers', 'directives/accordionDrtv'], function(controllers) {

    controllers.controller('PollResultCtrl', ['$scope', 'pollReply',
        function($scope, pollReply) {
            angular.extend($scope, pollReply);
            $scope.$parent.subTitle = $scope.poll.title;

            var charCount = {}, // 특정조사 카운트
                itemCount = {}, // 객관식 카운트
                itemShort = {}, // 주관식 응답 정보
                charUser  = {}, // 특정조사 유저별 응답 정보
                itemUser  = {}, // 객관식 문제 항목별 유저 정보
                itemData  = {}; // 객관식 문제 항목별 특정조사 항목별 투표수

            // 특정조사
            angular.forEach($scope.reply.characters, function(item) {
                var data = {};
                    data.total = item.reply.length;
                    data.reply = {};

                angular.forEach(item.reply, function(reply) {
                    if (!Number(data.reply[reply._id]++)) {
                        data.reply[reply._id] = 1;
                    }

                    charUser[reply.user] = charUser[reply.user] || {};
                    charUser[reply.user][item._id] = reply._id;
                });

                this[item._id] = data;
            }, charCount);

            // 객관식
            angular.forEach($scope.reply.itemMulti, function(item) {
                var data = {};
                    data.total = item.reply.length;
                    data.reply = {};

                angular.forEach(item.reply, function(reply) {
                    if (!Number(data.reply[reply._id]++)) {
                        data.reply[reply._id] = 1;
                        itemUser[reply._id] = [];
                    }

                    itemUser[reply._id].push(reply.user);
                });

                this[item._id] = data;
            }, itemCount);

            // 주관식
            angular.forEach($scope.reply.itemShort, function(item) {
                this[item._id] = item.reply;
            }, itemShort);

            // 객관식 문제 항목별 특정조사 분포도 처리
            angular.forEach(itemUser, function(users, itemId) {
                itemData[itemId] = {};                

                angular.forEach(users, function(userId) {
                    angular.forEach(charUser[userId], function(replyId, charId) {
                        this[charId] = this[charId] || {};
                        if (!Number(this[charId][replyId]++)) {
                            this[charId][replyId] = 1;
                        }
                    }, itemData[itemId]);
                });
            });

            // 스코프 적용
            $scope.charCount = charCount;
            $scope.itemCount = itemCount;      
            $scope.itemShort = itemShort;
            $scope.itemData  = itemData;
        }
    ]);
});