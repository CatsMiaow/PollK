'use strict';

define(['controllers/_controllers', 'services/PollSvc'], function(controllers) {

    controllers.controller('MainCtrl', ['$scope', '$location', 'Poll', 'polls',
        function($scope, $location, Poll, polls) {
            $scope.$parent.subTitle = '실시간 설문조사 서비스';
            
            $scope.polls = polls.list;
            $scope.count = polls.count;

            $scope.goTicket = function() {
                var password = $scope.password ? '/' + $scope.password : '';

                $location.path('/poll/' + Number($scope.ticket) + password);
            }
            
            $scope.goManager = function() {
                Poll.get($scope.managerKey, true).then(function(data) {
                    $location.path('/poll/edit/' + $scope.managerKey);
                });
            }

            $scope.goResult = function() {
                Poll.result($scope.resultKey, true).then(function(data) {
                    $location.path('/poll/result/' + $scope.resultKey);
                });
            }
        }
    ]);
});