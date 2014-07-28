'use strict';

define(['controllers/_controllers'], function(controllers) {
    controllers.controller('CommonCtrl', ['$scope', 'ErrorService', 'Socket',
        function($scope, ErrorService, Socket) {
            $scope.errorService = ErrorService;

            $scope.$on('event:loginRequired', function() {
                $location.path('/login');
            });

            Socket.on('user:count', function(data) {
                $scope.userCount = data;
            });
        }
    ]);
});