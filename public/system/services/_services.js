'use strict';

define(['angular', 'angularResource'], function(angular) {
    return angular.module('services', ['ngResource']).config(['$httpProvider',
        function($httpProvider) {
            // 전역 요청/응답 캐치
            $httpProvider.interceptors.push('HttpInterceptor');
            // DEPRECATED: $httpProvider.responseInterceptors.push('ErrorHttpInterceptor');

            // 요청 헤더 변경
            // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

            // $httpProvider.defaults.headers.common['Authentication'] = 'Key';

            // 요청/응답 데이터 가공
            // $httpProvider.defaults.transformRequest
            // $httpProvider.defaults.transformResponse
        }
    ]);
});
