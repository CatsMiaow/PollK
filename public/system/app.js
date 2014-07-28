'use strict';

define([
    'angular',
    'angularRoute',
    'angularSanitize',
    'angularCookies',
    // 'angularAnimate',
    'controllers/_controllers',
    'services/_services',
    'filters/_filters',
    'directives/_directives'
], function(angular) {
    return angular.module('PollK', [
        'ngRoute',
        'ngSanitize',
        'ngCookies',
        // 'ngAnimate',
        'controllers',
        'services',
        'filters',
        'directives'
    ]);
});