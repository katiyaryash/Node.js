var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
//var unique = require('uniq');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var maillist;

//to show full question when clicking on question title
router.get('/show/:id', function(req, res, next) {
    var posts = db.get('posts');
    posts.findOne(req.params.id, function(err, post) {
        res.render('show', {
            "post": post
        });

    });

});
db.collection("users").find({}, { 'email': true }, (function(err, results) {
    maillist = results;

    //console.log(maillist);
    // return maillist;
}));
router.get('/add', function(req, res, next) {
    var categories = db.get('categories');

    categories.find({}, {}, function(err, categories) {
        res.render('addposts', {
            "title": "Add Post",
            "categories": categories
        });
    });
});

router.post('/add', function(req, res, next) {
    // Get form values
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    //var image = req.body.mainimage;
    var date = new Date();

    if (req.files) {
        var mainImageOriginalName = req.files.mainimage.originalname;
        var mainImageName = req.files.mainimage.name;
        var mainImageMime = req.files.mainimage.mimetype;
        var mainImagePath = req.files.mainimage.path;
        var mainImageExt = req.files.mainimage.extension;
        var mainImageSize = req.files.mainimage.size;

    } else {

        var mainImageName = 'logo.png';
    }

    // Form Validation
    // req.checkBody('title', 'Your question must have a title').notEmpty();
    // req.checkBody('body', 'Body of question is required');

    ////////////////////////////////////////////////////////////////////////////////////
    //check errors
    // var errors = req.validationErrors();

    // if (errors) {
    //     res.render('addposts', {
    //         "errors": errors,

    //         "body": body
    //     });
    // } else {
    var posts = db.get('posts');

    // Submit to db
    posts.insert({
        "title": title,
        "body": body,
        "category": category,
        "date": date,
        "author": author,
        "mainimage": mainImageName
    }, function(err, post) {
        if (err) {
            res.send('There was an issue submitting the post');
        } else {
            req.flash('success', 'Post Submitted');
            res.location('/');
            res.redirect('/');
        }
    });
    /////////////////////////////////////////////////////////////////////
    var mailsArray = [];
    maillist.forEach(function(element) {
        mailsArray.push(element.email);
    }, this);

    console.log(mailsArray);
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: 'Gmail',
        auth: {

            user: 'katiyar.yash12@gmail.com',
            pass: 'yashkatiyar94'
        }

    });
    //var maillistt = 'yash.katiyar@webdunia.net,yash.katiyar94@gmail.com';
    var mailOptions = {
        from: 'yash',
        to: mailsArray,
        subject: 'Questionnaire',
        text: 'You have a new submission with the following details... Post: ' + req.body.title,
        html: '<p> You have a new submission with the following details</p><ul><li> Post: ' + req.body.title
    };
    console.log("//////////////////send function///////////////");
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            res.redirect('/');
        } else {
            console.log('Message Sent' + info.response);
            res.redirect('/');
        }

    });
    //}

});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('success', 'You need to login first');
    res.location('/');
    res.redirect('/users/login');
    //req.flash('success', 'You need to login first');
    //res.redirect('/users/login');

}
// For adding comments

router.post('/addcomment', ensureAuthenticated, function(req, res, next) {
    // Get form values

    var body = req.body.body;
    var postid = req.body.postid;
    var commentdate = new Date();
    // Form Validation

    req.checkBody('body', 'Body of comment is required').notEmpty();

    //check errors
    var errors = req.validationErrors();

    if (errors) {
        var posts = db.get('posts');
        posts.findOne(postid, function(err, post) {
            res.render('show', {
                "errors": errors,

                "post": post
            });
        });

    } else {
        var comment = { "body": body, "commentdate": commentdate };
        var posts = db.get('posts');

        // Submit to db
        posts.update({
                "_id": postid
            }, {
                $push: {
                    "comments": comment
                }
            },
            function(err, doc) {
                if (err) {
                    throw err;
                } else {
                    req.flash('success', 'Comment Added');
                    res.location('/posts/show/' + postid);
                    res.redirect('/posts/show/' + postid);
                }

            }
        );

    }


});

module.exports = router;