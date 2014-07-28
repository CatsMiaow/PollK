'use strict';

define(['services/_services', 'NProgress', 'SocketIO'], function(services, NProgress, io) {

    // 에러메시지 관리
    services.factory('ErrorService', ['$window',
        function($window) {
            return {
                errorMessage: null,
                setError: function(msg) {
                    $window.scrollTo(0,0);
                    this.errorMessage = msg;
                },
                clear: function() {
                    this.errorMessage = null;
                }
            };
        }
    ]);

    // $httpProvider.interceptors.push('HttpInterceptor');
    // 모든 AngularJS Ajax Http 호출을 관리함
    services.factory('HttpInterceptor', ['$q', '$rootScope', 'ErrorService',
        function($q, $rootScope, ErrorService) {
            return {
                'request': function(req) {
                    NProgress.start();
                    return req || $q.when(req);
                },
                'requestError': function(req) {
                    if (canRecover(req)) {
                        return responseOrNewPromise
                    }

                    return $q.reject(req);
                },
                'response': function(res) {
                    NProgress.done();
                    return res || $q.when(res);
                },
                'responseError': function(res) {
                    if (res.status === 401) {
                        $rootScope.$broadcast('event:loginRequired');
                    } else if (res.status >= 400 && res.status < 500 || res.status === 500) {
                        ErrorService.setError(res.data.replace(/\"/g,'') || 'Error '+res.status);
                    }

                    NProgress.done();
                    return $q.reject(res);
                }
            };
        }
    ]);
    
    // 리소스 공통 설정
    services.factory('Resource', ['$resource',
        function($resource) {
            return function(path, param) {
                param =  param || {};
                param.t = new Date().getTime();

                return $resource('/api/' + path, param, {
                    query: { isArray:false },
                    update: { method:'PUT' }
                });
            }
        }
    ]);

    // Socket.IO
    services.factory('Socket', ['$rootScope',
        function($rootScope) {
            var socket = io();

            return {
                on: function(eventName, callback) {
                    socket.on(eventName, function() {
                        var args = arguments;

                        $rootScope.$apply(function() {
                            callback.apply(socket, args);
                        });
                    });
                },
                emit: function(eventName, data, callback) {
                    socket.emit(eventName, data, function() {
                        var args = arguments;

                        $rootScope.$apply(function() {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    });
                }
            };
        }
    ]);
});
