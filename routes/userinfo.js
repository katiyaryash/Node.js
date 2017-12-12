var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:user', function(req, res, next) {
    var db = req.db;
    var users = db.get('users');
    users.find({ user: req.params.user }, {}, function(err, users) {
        res.render('uinfo', {
            "title": req.params.user,
            "users": users


        });
    });

});
module.exports = router;