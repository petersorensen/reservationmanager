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

var Groups = require('../models/groups');
var Locations = require('../models/locations');

var groupRouter = express.Router();
groupRouter.use(bodyParser.json());

var Verify = require('./verify');

groupRouter.route('/')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        Groups.find(req.query)
        .populate('locationId')
        .exec(function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })

//	.post(Verify.verifyTopManager, Verify.verifyAdmin, function (req, res, next) {
    .post(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager,function (req, res, next) {
        console.log(req.body)
        Groups.create(req.body, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })

    .delete(Verify.verifyTopManager, Verify.verifyAdmin, function (req, res, next) {
        Groups.remove({}, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });

groupRouter.route('/:inGroup')
   .get(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
//        People.findById(req.params.personId)
        console.log("Finder gruppe")
        console.log(req.params.inGroup)
        Groups.findOne({_id: req.params.inGroup})
//            .populate('comments.postedBy')
            .exec(function (err, resp) {
                if (err) { return next(err); }
                console.log(resp)
                res.json(resp);
            });
    })

    .put(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
        Groups.findByIdAndUpdate(req.params.inGroup, {
            $set: req.body
        }, {
            new: true
        }, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })
	
    .delete(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
        Groups.findByIdAndRemove(req.params.inGroup, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });


module.exports = groupRouter;