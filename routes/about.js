var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var categories = db.get('categories');
    categories.find({}, {}, function(err, categories) {
        res.render('about', { title: 'About' });
    });
});

module.exports = router;