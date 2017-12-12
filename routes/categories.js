var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');


/////// it will help u to render all post related to particular category clicked**************************************************
router.get('/show/:category', function(req, res, next) {
    var db = req.db;
    var posts = db.get('posts');
    posts.find({ category: req.params.category }, {}, function(err, posts) {
        res.render('index', {
            "title": req.params.category,
            "posts": posts
        });
    });

});


router.get('/add', function(req, res, next) {
    var categories = db.get('categories');
    categories.find({}, {}, function(err, categories) {
        res.render('addcategory', {
            "title": "Add Category",
            "categories": categories
        });

    });
});

router.post('/add', function(req, res, next) {
    // Get form values
    var title = req.body.title;


    // Form Validation
    // req.checkBody('title', 'Your question must have a title').notEmpty();
    // req.checkBody('body', 'Body of question is required');

    ////////////////////////////////////////////////////////////////////////////////////
    //check errors
    // var errors = req.validationErrors();

    // if (errors) {
    //     res.render('addcategory', {
    //         "errors": errors,

    //         "body": body
    //     });
    // } else {
    var categories = db.get('categories');

    // Submit to db
    categories.insert({
        "title": title,

    }, function(err, category) {
        if (err) {
            res.send('There was an issue submitting the post');
        } else {
            req.flash('success', 'category Submitted');
            res.location('/');
            res.redirect('/posts/add');
        }
    });

    //}

});


module.exports = router;