'use strict';

var _ = require('underscore');

// 공통설정
var config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8000
}

// 개발환경설정
var environment = {
    development: {
        db: {
            uri: 'mongodb://localhost:27017/pollDev',
            options: {
                user: '',
                pass: ''
            }
        }
    },
    production: {
        db: {
            uri: 'mongodb://localhost:27017/pollPro',
            options: {
                user: 'user',
                pass: 'password'
            }
        }
    }
}


module.exports = _.extend(config, environment[config.env]);