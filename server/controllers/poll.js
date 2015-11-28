'use strict';

var mongoose = require('mongoose')
  , async = require('async')
  , _     = require('underscore')
  , Poll  = mongoose.model('Poll')
  , PollReply = mongoose.model('PollReply');

// :pollId
exports.load = function(req, res, next, id) {
    Poll.load(id, function(err, poll) {
        // if (err) return next(err);
        // if (!poll) return next(new Error('Failed to load poll ' + id));
        if (err || !poll) {
            return next(new Error('일치하는 정보가 없거나, 진행 또는 종료된 설문입니다.'));
        }

        req.poll = poll;
        next();
    }, req.query.isCount, req.query.ticket);
};

// :replyId
exports.loadReply = function(req, res, next, id) {
    PollReply.load(id, function(err, pollReply) {
        if (err || !pollReply) {
            return next(new Error('집계된 결과 데이터가 없습니다.'));
        }

        req.pollReply = pollReply;
        next();
    }, req.query.isCount);
};

exports.list = function(req, res) {
    async.parallel([
        function(callback) {
            if (!req.query.count) {
                return callback(null, false);
            }

            Poll.count(req.query.search, function(err, count) {
                if (err) {
                    return res.status(500).send(err);
                }

                callback(null, count);
            });
        },
        function(callback) {
            Poll.find(_.extend(JSON.parse(req.query.search), {
                password: { $in: [null, ""] }
            }), '-_id')
                .skip(req.query.offset).limit(req.query.limit)
                .sort('-created').exec(function(err, polls) {
                    if (err) {
                        return res.status(500).send(err);
                    }

                    var data = {};
                    polls.forEach(function(poll, index) {
                        var label = 'default';
                        if (poll.ticket) {
                            label = 'success';
                        } else if (poll.finished) {
                            label = 'danger';
                        }

                        data[index] = {
                            title: poll.title,
                            label: label
                        };
                    });

                    callback(null, data);
                });
        }
    ], function(err, result) {
        res.json({
            'count': result[0],
            'list' : result[1],
            'limit': req.query.limit
        });
    });
};

exports.create = function(req, res) {
    var poll = new Poll(req.body);
    // poll.user = req.user;

    poll.save(function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        
        res.json(poll);
    });
};

exports.read = function(req, res) {
    res.json(req.poll);
};

exports.update = function(req, res) {
    var poll = _.extend(req.poll, req.body);

    poll.save(function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        res.json(poll);
    });
};

exports.remove = function(req, res) {
    var poll = req.poll;

    poll.remove(function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        res.json(poll);
    });
};

exports.ticketing = function(req, res) {
    var poll = req.poll;
    if (poll.started || poll.ticket) {
        return res.status(500).send('이미 진행된 설문입니다.');
    }
    
    Poll.find({ // 진행 중인 설문들의 방 번호를 추출
        ticket: { $exists: true }
    }, '-_id ticket', function(err, polls) {
        if (err) {
            return res.status(500).send(err);
        }

        var tickets = []; // 진행 중인 방 번호를 가져와서
        polls.forEach(function(poll, index) {
            tickets.push(poll.ticket);
        });

        // 중복되지 않은 방 번호를 생성한다.
        var getTicket = function() {
            var ticket = _.random(1000, 9999);

            if (!_.contains(tickets, ticket)) {
                return ticket;
            }

            getTicket();
        }
        
        poll.started = new Date();
        poll.ticket = getTicket();
        poll.save(function(err) {
            if (err) {
                return res.status(500).send(err);
            }

            res.json({ ticket: poll.ticket }); 
        });
    });
};

exports.step = {
    start: function(req, res) {
        Poll.findOne({
            ticket: req.params.ticket,
            finished: false,
            $or: [
                { password: { $in: [null, ""] } },
                { password: req.params.password }
            ]
        }, '-_id', function(err, poll) {
            if (err || !poll) {
                return res.status(500).send(err || '진행 중인 설문이 아닙니다.');
            }

            res.json(poll);
        });
    },
    result: function(req, res) {
        Poll.findOne({
            _id     : req.params.replyId,
            finished: true,
            started : null,
            ticket  : null
        }, '-_id', function(err, poll) {
            if (err || !poll) {
                return res.status(500).send(err || '종료된 설문이 아닙니다.');
            }

            res.json({
                poll : poll,
                reply: req.pollReply
            });
        });
    }
};
