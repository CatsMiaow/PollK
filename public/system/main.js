'use strict';

var isIE8 = /MSIE [5-8]/.test(navigator.userAgent);


require.config({
    baseUrl: '/system',
    paths: {
        angular        : '//ajax.googleapis.com/ajax/libs/angularjs/1.2.19/angular.min',
        angularRoute   : '//ajax.googleapis.com/ajax/libs/angularjs/1.2.19/angular-route.min',
        angularResource: '//ajax.googleapis.com/ajax/libs/angularjs/1.2.19/angular-resource.min',
        angularSanitize: '//ajax.googleapis.com/ajax/libs/angularjs/1.2.19/angular-sanitize.min',
        angularCookies : '//ajax.googleapis.com/ajax/libs/angularjs/1.2.19/angular-cookies.min',
        angularAnimate : '//ajax.googleapis.com/ajax/libs/angularjs/1.2.19/angular-animate.min',
        jQuery         : '//ajax.googleapis.com/ajax/libs/jquery/'+(isIE8 ? '1.11.1' : '2.1.1')+'/jquery.min',
        bootstrap      : '//netdna.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min',
        SocketIO       : '/socket.io/socket.io',
        domReady       : '../vendor/domReady',      
        NProgress      : '../vendor/nprogress',
        Moment         : '../vendor/moment'
    },
    shim: {
        angular        : { deps: ['SocketIO', 'jQuery'], exports: 'angular' },
        angularRoute   : ['angular'],
        angularResource: ['angular'],
        angularSanitize: ['angular'],
        angularCookies : ['angular'],
        angularAnimate : ['angular'],
        bootstrap      : isIE8 ? ['jQuery', '../vendor/html5shiv', '../vendor/respond'] : ['jQuery'],
        SocketIO       : { exports: 'io' }
    }
});


require([
    'NProgress'
], function(NProgress) {
    NProgress.start();

    require([
        'angular',
        'app',
        'domReady',
        'bootstrap',

        'services/CommonSvc',
        'directives/commonDrtv',
        'controllers/CommonCtrl',

        'controllers/MainCtrl',
        'controllers/PollFormCtrl',
        'controllers/PollStepCtrl',
        'controllers/PollResultCtrl'
    ], function(angular, app, domReady) {
        app.config(['$routeProvider',
            function($routeProvider) {
                $routeProvider
                    .when('/', {
                        controller: 'MainCtrl',
                        templateUrl: 'views/main',
                        resolve: {
                            polls: ['Poll', function(Poll) {
                                return Poll.list();
                            }
                        ]}
                    }).when('/poll/new', { // 설문 등록
                        controller: 'PollNewCtrl',
                        templateUrl: 'views/pollForm'
                    }).when('/poll/edit/:pollId', { // 설문 수정
                        controller: 'PollEditCtrl',
                        templateUrl: 'views/pollForm',
                        resolve: {
                            poll: ['Poll', function(Poll) {
                                return Poll.get();
                            }
                        ]}
                    }).when('/poll/result/:replyId', { // 설문 결과
                        controller: 'PollResultCtrl',
                        templateUrl: 'views/pollResult',
                        resolve: {
                            pollReply: ['Poll', function(Poll) {
                                return Poll.result();
                            }
                        ]}
                    }).when('/poll/:ticket/:password?', { // 설문 진행 
                        controller: 'PollStepCtrl',
                        templateUrl: 'views/pollStep',
                        resolve: {
                            poll: ['Poll', function(Poll) {
                                return Poll.step();
                            }
                        ]}
                    }).otherwise({
                        redirectTo: '/'
                    });
            }
        ]);

        app.run(['$window', '$rootScope', '$cookieStore', 'Socket', 'ErrorService',
            function($window, $rootScope, $cookieStore, Socket, ErrorService) {
                $rootScope.beforeUnload = true;

                Socket.on('connect', function() {
                    // console.log('Socket Connect');
                });

                Socket.on('reconnect', function() {
                    ErrorService.setError('서버에 재접속되었습니다.');
                });

                Socket.on('reconnecting', function() {
                    ErrorService.setError('서버에 재접속을 시도 중입니다.');
                    $cookieStore.remove('poll');
                    $rootScope.beforeUnload = false;
                    $window.location.href = '/';
                });

                Socket.on('error', function(e) {
                    ErrorService.setError(e || 'A unknown error occurred');
                    $cookieStore.remove('poll');
                    $rootScope.beforeUnload = false;
                    $window.location.href = '/';
                });

                Socket.on('disconnect', function(e) {
                    if (e.toString() == 'io server disconnect') {
                        $window.alert('다중 접속으로 연결을 종료합니다.');
                        $window.open('about:blank', '_self').close();
                    }
                });

                angular.element('#container').removeClass('hide');
                NProgress.done();
            }
        ]);

        domReady(function() {
            angular.bootstrap(document, ['PollK']);
        });
    });
});