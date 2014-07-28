'use strict';

var express = require('express')
  , fs = require('fs')
  , appPath = process.cwd();


module.exports = function() {
    var app = express()
      , router = require(appPath + '/server/config/express')(app);


    var walk = function(path, isRouter) {
        fs.readdirSync(path).forEach(function(file) {
            var newPath = path + '/' + file
              , stat = fs.statSync(newPath);

            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    if (isRouter) {
                        require(newPath)(router);
                    } else {
                        require(newPath)
                    }
                }
            } else if (stat.isDirectory()) { // stat.isDirectory() && file !== 'orderFolder'
                walk(newPath, isRouter);
            }
        });
    };
    
    // Models Load
    walk(appPath + '/server/models');

    // Routes Load
    walk(appPath + '/server/routes', true);

    return app;
};