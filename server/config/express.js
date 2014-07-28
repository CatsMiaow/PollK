'use strict';

var express = require('express')
  , appPath = process.cwd();

/*<Express 미들웨어>*/
var favicon        = require('serve-favicon')
  , morgan         = require('morgan') // logger
  , bodyParser     = require('body-parser')
  , compress       = require('compression')
  , cookieParser   = require('cookie-parser')
  , session        = require('express-session')
  , methodOverride = require('method-override')
  , csrf           = require('csurf');
/*</Express 미들웨어>*/


module.exports = function(app) {
    var router = express.Router();

    // All Environments
    app.set('views', appPath + '/views');
    app.set('view engine', 'jade');

    app.use(favicon(appPath + '/public/favicon.ico'));
    // app.use(morgan('dev'));
    app.use(compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        }, level: 9
    }));
    app.use(methodOverride());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended:true }));
    app.use(cookieParser());
    app.use(session({ secret:'Meow Miaow', key:'express.sid', resave:true, saveUninitialized:true }));
    // app.use(session({ secret: 'keyboard cat', key: 'sid', cookie: { secure: true }}))
    app.use(csrf());
    app.use(express.static(appPath + '/public'));

    // XSRF, AngularJS 보안 접두어 ")]}',\n" 는 어떻게 붙이지?
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });

    // router 적용 시점을 기준으로
    // 위에는 전역 핸들링
    // 아래는 에러 핸들링
    app.use(router);

    /// catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            
            if (res.statusCode == 500) {
                res.json(err.message);
            } else {
                res.render('error', {
                    message: err.message,
                    error: err
                });
            }
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    return router;
}