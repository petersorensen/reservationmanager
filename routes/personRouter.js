//extRouter

var dboper = require('./operations');

// skal kunne 
//   give alle personer
//   give alle personer 10 af gangen
//   give bestemt person udfra id
//   søgning ud fra string

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');


var User = require('../models/user');
var People = require('../models/people');

var personRouter = express.Router();
personRouter.use(bodyParser.json());

var Verify = require('./verify');

var cb0 = function (req, res, next) {
  console.log('CB0')
  next(5)
}

var cb1 = function (tal,req, res, next) {
  console.log('CB1 ')
  next()
}

personRouter.route('/')
	.get(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
            if (!req.decoded._doc.person.isTopManager) {
                if (req.query["inGroup"]) {
                    if (-1 === req.decoded._doc.person.managerOfGroups.indexOf(req.query["inGroup"]))
                        return next("You are not authorized");
                }
                else
                    req.query["inGroup"] = { $in: req.decoded._doc.person.managerOfGroups }
            }
            People.find(req.query)
            .populate('workLocation')
            .populate('inGroup')
            .populate('managerOfGroups')
            .exec(function (err, resp) {
                if (err) { return next(err); }
                res.json(resp);
            });
        
    })

     // any person can register
	.post(function (req, res, next) {
//        console.log("INSERTING NEW PERSON: ", req.body);
        var password = req.body.password;
        req.body.password = null;
        People.create(req.body, function (err, person) {
            if (err) {
                    console.log("ERROR USER ",req.body.firstname)
//                console.log(err);
                return next(err); 
            } 
            var id = person._id;
            User.register(new User({ username : req.body.username,personId: person._id,admin: false }),
                password, function(err, user) {
                    if (err) {
                        console.log("error in register PHS - users",req.body.username)
                        // delete person  before returning
                          return next(err); 
                    };
                    console.log("NEW USER ",user.username)
                res.json(person);
               });
        });

    })


    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        People.remove({}, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });

personRouter.route('/groupmanagers/:groupId')
    .get(Verify.verifyOrdinaryUser,function (req, res, next) {
        People.find({managerOfGroups: req.params.groupId})
        .exec(function (err, resp) {
            if (err) { return next(err); }
            let people = resp.map(function(y){return {_id: y._id, firstname: y.firstname, familyname: y.familyname}});  // der skal være en entry fordi person er manager  
            res.json(people);
        });
    });


personRouter.route('/:personId')
//  dboper.findDocuments(db, "people",{ _id: "57d9267849416615e46887ac" }, function (docs) {
   .get(Verify.verifyOrdinaryUser, function (req, res, next) {
//        People.findById(req.params.personId)
        People.findOne({_id: req.params.personId})
            .populate('workLocation')
           .populate('inGroup')
           .populate('managerOfGroups')
//            .populate('comments.postedBy')
            .exec(function (err, resp) {
                if (err) { return next(err); }
                res.json(resp);
            });
    })

    .put(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
        People.findByIdAndUpdate(req.params.personId, {
            $set: req.body
        }, {
            new: true
        }, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })
	
    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        People.findByIdAndRemove(req.params.personId, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });


module.exports = personRouter;