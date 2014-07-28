'use strict';

var mongoose = require('mongoose')
  , _ = require('underscore')
  , crypto = require('crypto')
  , Poll  = mongoose.model('Poll')
  , PollReply = mongoose.model('PollReply');

var pollData = {};


exports.poll = function(socket, io) {
    var sID = crypto.createHash('md5').update(socket.sessionID).digest('hex');

    function joinCount(ticket) {
        io.to(ticket).emit('join:count', Object.keys(io.sockets.adapter.rooms[ticket]).length);
    }

    // 설문입장
    socket.on('join:poll', function(ticket, callback) {
        socket.join(ticket);

        if (!pollData[ticket]) { // 초기 세팅
            pollData[ticket] = {
                itemMulti : [],
                itemShort : [],
                characters: [],
                users     : []
            };

            setTimeout(function() {
                delete pollData[ticket];
            }, 1000*60*60*12); // 12h, 43200000
        }

        pollData[ticket].users[sID] = { // 사용자 정보 저장
            _id  : sID,
            ip   : socket.request.connection.remoteAddress,
            agent: socket.request.headers['user-agent']
        };

        joinCount(ticket);
        callback(ticket);
    });

    // 설문퇴장
    socket.on('leave:poll', function(ticket) {
        socket.leave(ticket);

        joinCount(ticket);
    });

    // 연결 종료 시 모든 설문퇴장 처리
    socket.on('disconnect', function() {
        socket.rooms.forEach(function(room, index) {
            // socket.leave(room);
            joinCount(room);
        });
    });


    // 특성조사 입력
    socket.on('insert:character', function(data) {
        var character = pollData[data.ticket].characters;

        character[data.characterId] = character[data.characterId] || {
            _id: data.characterId,
            reply: []
        };
        character[data.characterId].reply.push({
            _id : data.itemId,
            user: sID
        });
    });

    // 객관식 입력
    socket.on('insert:itemMulti', function(data) {
        pollData[data.ticket].itemMulti[data.questionId].reply.push({
            _id : data.itemId,
            user: sID
        });

        io.to(data.ticket).emit('data:itemMulti', data.questionNo, data.itemId);
    });

    // 주관식 입력
    socket.on('insert:itemShort', function(data) {
        pollData[data.ticket].itemShort[data.questionId].reply.unshift({
            user: sID,
            content: data.content
        });

        io.to(data.ticket).emit('data:itemShort', data.questionNo, data.content);
    });

    // 문제별 응답 정보 보내기
    socket.on('get:itemData', function(data, callback) {
        if (data.isMulti) { // 객관식일 때 항목별 투표수를
            var itemMulti =  pollData[data.ticket].itemMulti;

            itemMulti[data.questionId] = itemMulti[data.questionId] || {
                _id: data.questionId,
                reply: []
            };

            callback(_.countBy(itemMulti[data.questionId].reply, function(data) {
                return data._id;
            }));
        } else { // 주관식일 때 응답 리스트를
            var itemShort = pollData[data.ticket].itemShort;

            itemShort[data.questionId] = itemShort[data.questionId] || {
                _id: data.questionId,
                reply: []
            };

            callback(_.pluck(itemShort[data.questionId].reply, 'content'));
        }
    });

    // 설문 종료
    socket.on('end:poll', function(data, callback) {

        // 등록된 설문 삭제
        Poll.findOneAndUpdate({
            _id: data.pollId, ticket: data.ticket
        }, {
            $unset: { ticket: true, started: true },
            finished: true
        }, function(err) { // err, poll
            if (err) {
                callback(err);
                return false;
            }

            var poll = pollData[data.ticket];

            new PollReply({ // 중복 검사를 위해 추가한 키 값을 삭제하고 값만을 넘겨야 함
                _id: data.pollId,
                itemMulti : _.values(poll.itemMulti),
                itemShort : _.values(poll.itemShort),
                characters: _.values(poll.characters),
                users     : _.values(poll.users),
            }).save(function(err) {
                if (err) {
                    callback(err);
                    return false;
                }
                
                io.to(data.ticket).emit('result:poll', data.pollId);
            });
        });
    });
};