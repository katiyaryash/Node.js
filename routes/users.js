var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var http = require('http');
var server = http.createServer();
io = require('socket.io').listen(server);

var db = require('monk')('localhost/nodeblog');



var User = require('../models/user');
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
    res.render('register', {
        'title': 'Register'
    });
});
router.get('/login', function(req, res, next) {
    res.render('login', {
        'title': 'Login'
    });
});
router.get('/details', ensureAuthenticated, function(req, res, next) {
    var users = db.get('users');
    users.find({}, {}, function(err, users) {
        res.render('details', {
            "users": users
                // username: req.user.username


        });

    });
    // var db = req.db;
    // var posts = db.get('posts');

    // posts.find({}, {}, function(err, posts) {
    //     res.render('details', {
    //         "posts": posts
    //     });
    // });


});
router.get('/chat', function(req, res, next) {
    res.render('chat'

    );
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    //req.flash('success', 'You need to login first');
    res.redirect('/users/login');

}

router.post('/register', function(req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var team = req.body.team;
    var password = req.body.password;
    var password2 = req.body.password2;


    // Check for image fields
    if (req.file) {
        console.log('Uploading File...');

        //File info
        var profileImageOriginalName = req.files.profileimage.originalname;
        var profileImageName = req.files.profileimage.name;
        var profileImageMime = req.files.profileimage.mimetype;
        var profileImagePath = req.files.profileimage.path;
        var profileImageExt = req.files.profileimage.extension;
        var profileImageSize = req.files.profileimage.size;

    } else {
        //Set a default image
        var profileImageName = 'bg.jpg';
    }

    //Validations
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email not valid').notEmpty();
    req.checkBody('username', 'please select a unique username').notEmpty();
    req.checkBody('team', 'Please select a Team').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    //Check for errors
    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            username: username,
            team: team,
            password: password,
            password2: password2
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            team: team,
            password: password,
            profileimage: profileImageName
        });

        //Create user
        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            console.log(user);
        });

        //Success message
        req.flash('success', 'You are now registered and may login');
        res.location('/');
        res.redirect('/');
    }
});
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            if (!user) {
                console.log('Unknown User');
                return done(null, false, { message: 'unknown user' });
            }
            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    console.log('Invalid Password');
                    return done(null, false, { message: 'Invalid password' });
                }

            });
        });
    }
));
router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }), function(req, res) {
    console.log('Successfully logged in');
    req.flash('success', 'You are logged in now');
    res.redirect('/users/details');
});


router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/');
});
module.exports = router;