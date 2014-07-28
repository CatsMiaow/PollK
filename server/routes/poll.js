'use strict';

var poll = require('../controllers/poll');

module.exports = function(router) {
    router.get('/api/poll', poll.list);
    router.post('/api/poll', poll.create);
    router.get('/api/poll/:pollId', poll.read);
    router.put('/api/poll/:pollId', poll.update);
    router.delete('/api/poll/:pollId', poll.remove);

    router.put('/api/poll/:pollId/ticketing', poll.ticketing); // 설문 진행 번호 생성

    router.get('/api/poll/step/:ticket/:password?', poll.step.start); // 설문 입장
    router.get('/api/poll/result/:replyId', poll.step.result); // 설문 결과 저장

    // :pollId 값이 있을 때 poll.load 컨트롤러를 탄다.
    router.param('pollId', poll.load);
    router.param('replyId', poll.loadReply);
};