const express = require("express");
const router  = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Workshop = require("../models/workshop");
// password reset
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

router.get('/', (req, res) => {
    res.render('landing');
});

// Show sign up form
router.get('/register', (req, res) => {
    res.render('user/register');
});
// Handle sign-up logic
router.post('/register', (req, res) => {
    let newUser = new User({username: req.body.username, fullName: req.body.fullName, avatar: req.body.avatar, email: req.body.email});
    if(req.body.adminCode === 'workshopbuddy123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', "Welcome to workshop-buddy " + user.username);
            res.redirect('/workshops');
        });
    });
});

// Show login form
router.get('/login', (req, res) => {
    res.render('user/login');
});
// Handle login logic
router.post('/login', passport.authenticate('local',
    {
        successRedirect: '/workshops',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!'
    }), (req,res) => {
    
});


// Forgot password
router.get('/forgot', (req, res) => {
    res.render('user/forgot');
});

router.post('/forgot', (req, res, next) => {
    async.waterfall([
        (done) => {
            crypto.randomBytes(20, (err, buf) => {
            let token = buf.toString('hex');
            done(err, token);
            });
        },
    (token, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
                req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgot');
            }
    
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
            user.save((err) => {
                done(err, token, user);
            });
        });
    },
    (token, user, done) => {
        let smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: 'workshop0buddy@gmail.com',
                pass: process.env.GMAILPW // need to enter password in the root folder .env
            }
        });
        let mailOptions = {
            to: user.email,
            from: 'workshop0buddy@gmail.com',
            subject: 'Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
            console.log('mail sent');
            req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            done(err, 'done');
        });
    }
    ],  (err) => {
            if (err) return next(err);
            res.redirect('/forgot');
    });
});

router.get('/reset/:token', (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('user/reset', {token: req.params.token});
    });
});
  
  router.post('/reset/:token', (req, res) => {
    async.waterfall([
        (done) => {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
            }
            if(req.body.password === req.body.confirm) {
                user.setPassword(req.body.password, (err) => {
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
  
                    user.save((err) => {
                        req.logIn(user, (err) => {
                            done(err, user);
                        });
                    });
                })
            } else {
                req.flash("error", "Passwords do not match.");
                return res.redirect('back');
            }
        });
    },
    (user, done) => {
        var smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: 'workshop0buddy@gmail.com',
                pass: process.env.GMAILPW // need to enter password in the root folder .env
            }
        });
        var mailOptions = {
            to: user.email,
            from: 'workshop0buddy@gmail.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
        });
    }
    ], (err) => {
        res.redirect('/workshops');
    });
});


// Logout route
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'See you later!');
    res.redirect('/workshops');
});

// User profile
router.get("/user/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err) {
            req.flash("error", "Something went wrong.");
            return res.redirect("/");
        }
        Workshop.find().where('author.id').equals(foundUser._id).exec((err, workshops) => {
            if(err) {
                req.flash("error", "Something went wrong.");
                return res.redirect("/");
            }
            res.render("user/show", { user: foundUser, workshops: workshops });
        })
    });
});

module.exports = router;