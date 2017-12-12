var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var db = require('monk')('localhost/nodeblog');
var maillist;
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('contact', { title: 'Contact' });
});

db.collection("users").find({}, { 'email': true }, (function(err, results) {
    maillist = results;

    //console.log(maillist);
    // return maillist;
}));
//////// Imp for converting
router.post('/send', function(req, res, next) {
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
        text: 'You have a new submission with the following details... Name:' + req.body.name + 'Email:' + req.body.email + 'Message:' + req.body.message,
        html: '<p> You got a new submission with this details</p><ul><li> Name:' + req.body.name + '</li><li>Email:' + req.body.email + '</li><li>Message:' + req.body.message + '</li></ul>'
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
});
module.exports = router;