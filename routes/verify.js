var User = require('../models/user');
var People = require('../models/people');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');
var seeding = true;
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    if (seeding) return next();
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.getVerifiedPerson = function (req, res, next) {
    if (seeding) return next();
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
         People.findOne({_id: req.decoded._doc.personId})
            .exec(function (err, resp) {
                if (err || (!resp.isTopManager && (!resp.managerOfGroups || resp.managerOfGroups == []))) {
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);                            
                }
                req.decoded._doc.person = resp;
                return next();
            });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdmin = function (req, res, next) {
    if (seeding) return next();
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes

                console.log("Admin decoded", decoded)
                req.decoded = decoded;

                if (req.decoded._doc.admin){
                    next();
                }else{
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }
            }

        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyTopManager = function (req, res, next) {
    if (seeding) return next();
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                console.log("TopManager decoded", decoded)
                req.decoded = decoded;

                People.findOne({_id: req.decoded._doc.personId})
                    .exec(function (err, resp) {
                        if (err || !resp.isTopManager) { 
                            var err = new Error('You are not authorized to perform this operation!');
                            err.status = 403;
                            return next(err);
                        }
                        console.log("TOP MANAGER PERSON",resp);
                        return next();
                    });
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyManager = function (req, res, next) {
    if (seeding) return next();
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token && req.decoded._doc.person) {
        var person = req.decoded._doc.person;
        if (!person.isTopManager && (!person.managerOfGroups || person.managerOfGroups == [])) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);                            
        }
        return next();
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided or wrong calling sequence');
        err.status = 403;
        return next(err);
    }
};