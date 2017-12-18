//extRouter

var dboper = require('./operations');

// skal kunne 
//   give alle locationer
//   give bestemt location udfra id
//   søgning ud fra string

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Locations = require('../models/locations');

var locationRouter = express.Router();
locationRouter.use(bodyParser.json());

var Verify = require('./verify');

locationRouter.route('/')
    .get(function (req, res, next) {
//        console.log(req.query)
        Locations.find(req.query, function (err, resp) {
            if (err) { return next(err); }
            console.log("LOCATIONS FOUND")
            res.json(resp);
        });
    })

    .post(Verify.verifyTopManager,Verify.getVerifiedPerson, Verify.verifyAdmin, function (req, res, next) {
        Locations.create(req.body, function (err, resp) {
            if (err) { return next(err); }
//            console.log('Item inserted!');
//            console.log(resp);
            res.json(resp);
        });
    })

    .delete(Verify.verifyTopManager,Verify.getVerifiedPerson, Verify.verifyManager, function (req, res, next) {
        Locations.remove({}, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });

locationRouter.route('/:itemId')
   .get(Verify.verifyOrdinaryUser, function (req, res, next) {
         console.log('locationRouter/itemId')
         console.log(req.params.itemId)
        Locations.findOne({_id: req.params.itemId})
//            .populate('comments.postedBy')
            .exec(function (err, resp) {
                if (err) { return next(err); }
                console.log(resp)
                res.json(resp);
            });
    })

    .put(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
        Locations.findByIdAndUpdate(req.params.itemId, {
            $set: req.body
        }, {
            new: true
        }, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })
    
    .delete(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
        Locations.findByIdAndRemove(req.params.itemId, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });


module.exports = locationRouter;