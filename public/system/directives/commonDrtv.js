'use strict';

define(['directives/_directives'], function(directives) {
    
    directives.directive('errorBar', ['$parse', '$timeout',
        function($parse, $timeout) {
            return {
                restrict: 'A', // ex) <div error-bar message="errorService.errorMessage"></div>
                replace: true,
                template: '<div class="alert alert-danger alert-dismissable error-bar" ng-show="errorMessage">'
                    + '<button type="button" ng-click="hideError()" class="close" aria-hidden="true">&times;</button>'
                    + '{{errorMessage}}</div>',

                link: function(scope, element, attrs) {
                    var errorMessageAttr = attrs['message']; // 대문자 안됨
                    scope.errorMessage = null;

                    scope.$watch(errorMessageAttr, function(newVal) {
                        scope.errorMessage = newVal;

                        if (newVal) {
                            $timeout(function() {
                                scope.hideError();
                            }, 5000);
                        }
                    });

                    scope.hideError = function() {
                        scope.errorMessage = null;

                        // scope에서 errorMessageAttr 값의 변수를 찾아서 null 적용
                        $parse(errorMessageAttr).assign(scope, null);
                    };
                }
            };
        }
    ]);

    // Bootstrap div.form-group 오류 스타일 적용
    directives.directive('formGroup', function() {
        return {
            restrict: 'C',
            scope: true,
            link: function(scope, element, attrs) {
                var input = element.find('input[ng-model]');
                if (!input[0]) return false;

                scope.$watch(function() {
                    return input.hasClass('ng-dirty') && input.hasClass('ng-invalid');
                }, function(isInvalid) {
                    element.toggleClass('has-error', isInvalid);
                });
            }
        };
    });

    // 포커스 시 콘텐츠 자동 선택
    directives.directive('focusSelect', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function() {
                    this.select();
                });
            }
        };
    });

});