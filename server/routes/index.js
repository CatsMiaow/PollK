'use strict';

var index = require('../controllers/index');

module.exports = function(router) {

    router.get('/', index.render);

    // AngularJS $routeProvider templateUrl
    router.get('/views/:folder?/:name', index.views);

    // 서버 상태 체크
    router.get('/health', function(req, res) {
        res.status(200).send(new Buffer(JSON.stringify({
            pid: process.pid,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        })));
    });
};
