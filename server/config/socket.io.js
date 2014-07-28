'use strict';

var controller = require('../controllers/socket.io');
var user = {};


module.exports = function(io) {
    io.use(function(socket, next) {
        var data = socket.request;

        if (data.headers.cookie) {
            data.cookie = require('cookie').parse(data.headers.cookie);

            socket.sessionID = data.cookie['express.sid'];
        } else {
           next(new Error('No cookie transmitted.'));
        }

        next();
    });
    

    io.on('connection', function(socket) {
        var sID = socket.sessionID;
        
        if (user[sID]) {
            socket.disconnect();
            return false;
        }

        user[sID] = {
            id: socket.id,
            ip: socket.request.connection.remoteAddress,
            agent: socket.request.headers['user-agent']
        };

        io.emit('user:count', Object.keys(user).length);

        socket.on('disconnect', function() {
            delete user[sID];
            socket.broadcast.emit('user:count', Object.keys(user).length);
        });

        controller.poll(socket, io);
    });
}