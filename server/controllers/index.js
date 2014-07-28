'use strict';

exports.render = function(req, res) {
    res.render('index');
};

exports.views = function(req, res) {
    var name   = req.params.name
      , folder = req.params.folder;
      
    if (folder)
        name = folder+'/'+name;

    // console.log(req.params);
    res.render(name);
};