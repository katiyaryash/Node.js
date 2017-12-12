var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = require('monk')('localhost/nodeblog');
//var db = mongoose.connection;
var http = require('http');
var fs = require('fs');
var path = require('path');

var routes = require('./routes/index');
var users = require('./routes/users');
var about = require('./routes/about');
var contact = require('./routes/contact');
var posts = require('./routes/posts');
var categories = require('./routes/categories');
var chat = require('./routes/chat');
var userinfo = require('./routes/userinfo');

var app = express();
server = require('http').createServer(app),
    app.locals.moment = require('moment');
////////////////////////////////////

////////////////////////////////////
// Function for Read more link
app.locals.truncateText = function(text, Length) {
    var truncatedText = text.substring(0, length);
    return truncatedText;
};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Handle File uploads

app.use(multer({ dest: './public/images/uploads/' }).array('mainimage'));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Handle Express Sessions
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//Passport
//**passport session should always be after the express session**
app.use(passport.initialize());
app.use(passport.session());

//Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formPara += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Connect flash
app.use(flash());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
//Make our db accessible to our router
app.use(function(req, res, next) {
    req.db = db;
    next();
});
// to hide certain tabs like register,logout etc
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();


});
app.use('/', routes);
app.use('/users', users);
app.use('/about', about);
app.use('/contact', contact);
app.use('/posts', posts);
app.use('/categories', categories);
app.use('/chat', chat);
app.use('/userinfo', userinfo);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



// function requestHandler(req, res) {
//     if (req.url === '/about') {
//         sendIndexHtml(res);
//     } else if (req.url === '/about') {
//         sendListOfUploadedFiles(res);
//     } else if (/\/download\/[^\/]+$/.test(req.url)) {
//         sendUploadedFile(req.url, res);
//     } else if (/\/upload\/[^\/]+$/.test(req.url)) {
//         saveUploadedFile(req, res);
//     } else {
//         sendInvalidRequest(res);
//     }
// }

// function sendIndexHtml(res) {
//     var indexFile = path.join(__dirname, 'up.jade');

//     fs.readFile(indexFile, function(err, content) {
//         if (err) {
//             res.writeHead(404, { 'Content-Type': 'text' });
//             res.write('File Not Found!');
//             res.end();
//         } else {
//             res.writeHead(200, { 'Content-Type': 'text/html' });
//             res.write(content);
//             res.end();
//         }
//     });
// }

// function sendListOfUploadedFiles(res) {
//     var uploadDir = path.join(__dirname, 'download');
//     fs.readdir(uploadDir, function(err, files) {
//         if (err) {
//             console.log(err);
//             res.writeHead(400, { 'Content-Type': 'application/json' });
//             res.write(JSON.stringify(err.message));
//             res.end();
//         } else {
//             res.writeHead(200, { 'Content-Type': 'application/json' });
//             res.write(JSON.stringify(files));
//             res.end();
//         }
//     });
// }


// function sendUploadedFile(url, res) {
//     var file = path.join(__dirname, url);
//     fs.readFile(file, function(err, content) {
//         if (err) {
//             res.writeHead(404, { 'Content-Type': 'text' });
//             res.write('File Not Found!');
//             res.end();
//         } else {
//             res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
//             res.write(content);
//             res.end();
//         }
//     });
// }


// function saveUploadedFile(req, res) {
//     console.log('saving uploaded file');
//     var fileName = path.basename(req.url);
//     var file = path.join(__dirname, 'download', fileName);
//     req.pipe(fs.createWriteStream(file));
//     req.on('end', function() {
//         res.writeHead(200, { 'Content-Type': 'text' });
//         res.write('uploaded succesfully');
//         res.end();
//     });
// }

// function sendInvalidRequest(res) {
//     res.writeHead(400, { 'Content-Type': 'application/json' });
//     res.write('Invalid Request');
//     res.end();
// }
///////////////////////////////////////////////////////////////////////////////
module.exports = app;