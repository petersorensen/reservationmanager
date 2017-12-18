var express = require('express');
var router = express.Router();
var passport = require('passport');

//var User = require('../models/user');
var People = require('../models/people');
//var userRouter = express.Router();
var Verify = require('./verify');
var Users = require('../models/user');

router.route('/')
    .get(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
        console.log("GETTING USERS")
        Users.find({}, function (err, users) {
            if (err) {
                return next(err);
            }
            res.json(users);
        })
    })
    .delete(/*Verify.verifyOrdinaryUser, Verify.verifyAdmin,*/ function (req, res, next) {
        Users.remove({}, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });


router.post('/register', function(req, res) {
    console.log("REGISTER");

    req.body.username = req.body.username.toUpperCase()
    Users.register(new User({ username : req.body.username,personId: req.body.personID}),
        req.body.password, function(err, user) {
            if (err) {
                console.log("error in register PHS - people")
                return res.status(500).json({err: err});
            }
            console.log("NEW USER REGISTRATED");
            user.save(function(err,user) {
                passport.authenticate('local')(req, res, function () {
                    return res.status(200).json({status: 'Registration Successful!'});
                });
            });
        });
})
;

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        console.log("LOGIN")
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            console.log("user-2: ",user)
            var token = Verify.getToken(user);
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token,
                personId: user.personId
            });
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

router.get('/facebook', passport.authenticate('facebook'),
    function(req, res){});

router.get('/facebook/callback', function(req,res,next){
    passport.authenticate('facebook', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            var token = Verify.getToken(user);
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
            });
        });
    })(req,res,next);
});

module.exports = router;