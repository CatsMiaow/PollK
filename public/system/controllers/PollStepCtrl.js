'use strict';

define(['controllers/_controllers', 'services/PollSvc'], function(controllers) {

    controllers.controller('PollStepCtrl', ['$scope', '$window', '$location', '$cookieStore', '$controller', 'Socket', 'poll',
        function($scope, $window, $location, $cookieStore, $controller, Socket, poll) {
            $scope.$parent.subTitle = poll.title;
            $scope.href = $window.location.href;

            // $cookieStore.remove('poll');
            var cookie = $cookieStore.get('poll') || {}
              , cookie = (cookie.ticket == poll.ticket) ? cookie : {};

            angular.extend($scope, poll);

            $scope.characterStarted = cookie.characterStarted || false; // 특성조사 시작
            $scope.characterNo      = cookie.characterNo || 0; // 특성조사 번호
            $scope.questionStarted  = cookie.questionStarted || false; // 질문 시작
            $scope.questionNo       = cookie.questionNow || 0; // 질문 번호
            $scope.questionNow      = angular.isNumber(cookie.questionNow) ? cookie.questionNow : -1; // 현재 진행한 번호
            $scope.nextButton       = true; // 다음 버튼 비활성화
            $scope.selectedItem     = cookie.selectedItem || {}; // 선택된 항목들
            $scope.itemData         = {}; // 항목별 응답 정보
            $scope.itemCount        = {}; // 응답 정보 카운트
            $scope.itemShort        = { answer: '' }; // 주관식 입력


            // 입장 전송
            Socket.emit('join:poll', poll.ticket, function(ticket) {
                cookie.ticket = ticket;
                $cookieStore.put('poll', cookie);
            });

            // 입장 인원 체크
            Socket.on('join:count', function(count) {
                $scope.joinCount = count;

                if (!$scope.characterStarted && !$scope.questionStarted) {
                    $scope.entryWidth = Math.round(count / $scope.minEntry * 100);
                    if (count >= $scope.minEntry) { // 입장인원 초과 시 특성조사 시작
                        $scope.characterStarted = cookie.characterStarted = true;
                        $cookieStore.put('poll', cookie);
                    }
                }
            });

            // 객관식 응답 정보 갱신
            Socket.on('data:itemMulti', function(no, item) {
                if (!Number($scope.itemData[no][item] += 1)) {
                    $scope.itemData[no][item] = 1;
                }
                $scope.itemCount[no] += 1;
            });

            // 주관식 응답 정보 갱신
            Socket.on('data:itemShort', function(no, content) {
                $scope.itemData[no].unshift(content);
            });

            // 결과 페이지 이동
            Socket.on('result:poll', function(pollId) {
                $scope.beforeUnload = false;
                $cookieStore.remove('poll');
                $location.path('/poll/result/' + pollId);
            });


            $scope.copyUrl = function() {
                $window.prompt('아래 주소를 복사하여 설문을 공유하세요.', $scope.href);
            }

            $window.onbeforeunload = function() {
                if ($scope.beforeUnload) { return '설문이 진행 중입니다.'; }
            }

            $scope.$on('$locationChangeStart', function(event, next, current) {
                if($scope.beforeUnload && !$window.confirm('설문이 진행 중입니다.\n\n이 페이지를 벗어나시겠습니까?')) {
                    event.preventDefault();
                    return false;
                }

                // 페이지를 벗어났을 때 퇴장 전송
                Socket.emit('leave:poll', poll.ticket);
            });


            // Parent: PollStepCtrl
            // 코드 역할 구분으로 컨트롤러를 분리
            $controller('CharacterCtrl', {$scope: $scope, cookie: cookie});
            $controller('QuestionCtrl', {$scope: $scope, cookie: cookie});
        }
    ]);

    // 특정조사 컨트롤러
    controllers.controller('CharacterCtrl', ['$scope', '$cookieStore', 'Socket', 'cookie',
        function($scope, $cookieStore, Socket, cookie) {
            // 특성조사 번호 추적
            $scope.$watch('characterNo', function(no) {
                $scope.characterWidth = Math.round((no + 1) / $scope.characters.length * 100);
            });
            
            // 특성조사 항목 선택
            $scope.selectCharacter = function(item) {
                var character = $scope.characters[$scope.characterNo];
                Socket.emit('insert:character', {
                    ticket: $scope.ticket,
                    characterId: character._id,
                    itemId: character.items[item]._id
                });

                if ($scope.characterNo >= $scope.characters.length - 1) {
                    // 질문 시작
                    $scope.characterStarted = cookie.characterStarted = false;
                    $scope.questionStarted = cookie.questionStarted = true;
                    $cookieStore.put('poll', cookie);
                    return false;
                }

                $scope.characterNo++;

                cookie.characterNo = $scope.characterNo;
                $cookieStore.put('poll', cookie);
            }
        }
    ]);

    // 질문 컨트롤러
    controllers.controller('QuestionCtrl', ['$scope', '$cookieStore', '$window', 'Socket', 'Poll', 'cookie',
        function($scope, $cookieStore, $window, Socket, Poll, cookie) {
            // 질문 번호 추적
            $scope.$watch('questionNo', function(no) {
                $scope.questionWidth = Math.round((no + 1) / $scope.questions.length * 100);
                $scope.isLast = no >= $scope.questions.length - 1;

                Socket.emit('get:itemData', {
                    ticket    : $scope.ticket,
                    questionId: $scope.questions[no]._id,
                    isMulti   : $scope.questions[no].isMulti
                }, function(data) {
                    $scope.itemData[no] = data;

                    // 객관식 카운트
                    if ($scope.questions[no].isMulti) {
                        $scope.itemCount[no] = Object.keys($scope.itemData[no]).reduce(function (count, item) {
                            return count + $scope.itemData[no][item];
                        }, 0);
                    }
                });
            });

            // 진행 중인 번호 추적
            $scope.$watch('questionNow', function(no) {
                // 마지막 질문이 아닐 때 버튼 활성화
                if (no >= 0 && no < $scope.questions.length - 1) {
                    $scope.nextButton = false;
                }
            });

            // 객관식 항목 선택
            $scope.selectQuestion = function(item) {
                if (!$scope.nextButton
                    || angular.isNumber($scope.selectedItem[$scope.questionNo])) {
                    return false;
                }

                var question = $scope.questions[$scope.questionNo];
                Socket.emit('insert:itemMulti', {
                    ticket    : $scope.ticket,
                    questionId: question._id,
                    questionNo: $scope.questionNo,
                    itemId    : question.items[item]._id
                });

                $scope.selectedItem[$scope.questionNo] = item;
                cookie.selectedItem = $scope.selectedItem;

                $scope.questionNow = cookie.questionNow = $scope.questionNo;
                $cookieStore.put('poll', cookie);
            }

            // 주관식 답변 입력
            $scope.answerQuestion = function() {
                if (!$scope.nextButton
                    || $scope.selectedItem[$scope.questionNo]) {
                    return false;
                }

                Socket.emit('insert:itemShort', {
                    ticket    : $scope.ticket,
                    questionId: $scope.questions[$scope.questionNo]._id,
                    questionNo: $scope.questionNo,
                    content   : $scope.itemShort.answer
                });
                
                $scope.selectedItem[$scope.questionNo] = $scope.itemShort.answer;
                cookie.selectedItem = $scope.selectedItem;

                $scope.questionNow = cookie.questionNow = $scope.questionNo;
                $cookieStore.put('poll', cookie);

                $scope.itemShort.answer = '';
            }

            // 다음 질문
            $scope.nextQuestion = function() {
                $scope.questionNo++;

                // 진행하지 않은 질문이거나 마지막 일 때 버튼 비활성화
                if ($scope.questionNo > $scope.questionNow || $scope.isLast) {
                    $scope.nextButton = true;
                }
            }

            // 이전 질문
            $scope.prevQuestion = function() {
                $scope.nextButton = false;
                $scope.questionNo--;
            }

            // 설문 종료
            $scope.endQuestion = function(pollId) {
                if (!$window.confirm('설문을 종료하시겠습니까?\n\n종료 후 다시 진행할 수 없으며, 결과 페이지로 이동됩니다.')) {
                    return false;
                }

                Poll.get(pollId, true, $scope.ticket).then(function(data) {
                    Socket.emit('end:poll', {
                        pollId: pollId,
                        ticket: $scope.ticket
                    }, function(err) {
                        $window.alert(angular.toJson(err));
                    });
                });
            }
        }
    ]);
});