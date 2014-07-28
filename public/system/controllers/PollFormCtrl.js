'use strict';

define(['controllers/_controllers', 'services/PollSvc'], function(controllers) {

    controllers.controller('PollNewCtrl', ['$scope', '$location', 'Poll',
        function($scope, $location, Poll) {
            $scope.$parent.subTitle = '설문등록';

            $scope.poll = new Poll.conn({
                characters: [{
                    items: [{},{}]
                }],
                questions: [{
                    isMulti: true,
                    items: [{},{}]
                }],
                minEntry: 4
            });

            $scope.save = function() {
                $scope.poll.$save(function(data) {
                    $location.path('/poll/edit/' + data._id);
                });
            }
        }
    ]);

    controllers.controller('PollEditCtrl', ['$scope', '$location', '$window', 'Poll', 'poll',
        function($scope, $location, $window, Poll, poll) {
            $window.scrollTo(0,0);
            $scope.$parent.subTitle = '설문관리';

            $scope.poll = poll;
            $scope.poll.pollId = poll._id;

            $scope.save = function() {
                $scope.poll.$update(function(data) {
                    $scope.beforeUnload = false;
                    $location.path('/poll');
                });
            }

            $scope.remove = function() {
                if (!$window.confirm('설문을 삭제하시겠습니까?\n\n삭제된 설문은 복구할 수 없습니다.')) {
                    return false;
                }

                $scope.poll.$delete(function(data) {
                    delete $scope.poll;

                    $scope.beforeUnload = false;
                    $location.path('/poll');
                });
            }

            $scope.ticketing = function() {
                if (!$window.confirm('설문을 진행하시겠습니까?\n\n진행된 설문은 수정/삭제할 수 없으며,\n종료되지 않은 설문은 12시간 후에 삭제됩니다.')) {
                    return false;
                }

                Poll.ticketing().then(function(data) {
                    $scope.beforeUnload = false;

                    var password = '';
                    if ($scope.poll.password) {
                        password = '/' + $scope.poll.password;
                    }

                    $location.path('/poll/' + data.ticket + password);
                });
            }
            
            $window.onbeforeunload = function() {
                if ($scope.beforeUnload) { return '본 페이지를 다시 접속하려면 반드시 암호키가 필요합니다.'; }
            }

            $scope.$on('$locationChangeStart', function(event, next, current) {
                if($scope.beforeUnload && !$window.confirm('본 페이지를 다시 접속하려면 반드시 암호키가 필요합니다.\n\n이 페이지를 벗어나시겠습니까?')) {
                    event.preventDefault();
                }
            });
        }
    ]);

    // 설문자 특성 조사
    controllers.controller('PollCharacterCtrl', ['$scope', '$window',
        function($scope, $window) {
            $scope.addCharacter = function() {
                var characters = $scope.poll.characters;
                    characters[characters.length] = {
                        items: [{},{}]
                    };
            };

            $scope.removeCharacter = function(index) {
                if (!$window.confirm('문제를 삭제할래요?')) {
                    return false;
                }

                $scope.poll.characters.splice(index, 1);
            };

            $scope.addCharacterItem = function(index) {
                var items = $scope.poll.characters[index].items;
                    items[items.length] = {};
            };

            $scope.removeCharacterItem = function(index, item) {
                if (!$window.confirm('항목을 삭제할래요?')) {
                    return false;
                }

                $scope.poll.characters[index].items.splice(item, 1);
            };
        }
    ]);

    // 설문 문항
    controllers.controller('PollQuestionCtrl', ['$scope', '$window',
        function($scope, $window) {
            $scope.addQuestion = function() {
                var questions = $scope.poll.questions;
                    questions[questions.length] = {
                        isMulti: true,
                        items: [{},{}]
                    };
            };

            $scope.removeQuestion = function(index) {
                if (!$window.confirm('문제를 삭제할래요?')) {
                    return false;
                }

                $scope.poll.questions.splice(index, 1);
            };

            $scope.addQuestionItem = function(index) {
                var items = $scope.poll.questions[index].items;
                    items[items.length] = {};
            };

            $scope.removeQuestionItem = function(index, item) {
                if (!$window.confirm('항목을 삭제할래요?')) {
                    return false;
                }

                $scope.poll.questions[index].items.splice(item, 1);
            };

            $scope.isMulti = function(question) {
                if (!question.isMulti) {
                    delete question.items;
                    return false;
                } else if (!question.items) {
                    question.items = [{},{}];
                }

                return true;
            }
        }
    ]);
});