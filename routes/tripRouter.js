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

var Trips = require('../models/trips');
var Vehicles = require('../models/vehicles');

var tripRouter = express.Router();
tripRouter.use(bodyParser.json());

var Verify = require('./verify');

tripRouter.route('/')
    .get(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson/*,Verify.verifyManager*/, function (req, res, next) {
        console.log("USER")
        if (!req.decoded._doc.person.isTopManager) {
            if (req.query["inGroup"]) {
                if (-1 === req.decoded._doc.person.managerOfGroups.indexOf(req.query["inGroup"]))
                    return next("You are not authorized");
            }
            else
                req.query["inGroup"] = { $in: req.decoded._doc.person.managerOfGroups }
        }
        Vehicles.find(req.query)
        .exec(function (err, resp) {
            if (err) { return next(err); }

            let groups = resp.map(function(y){return y._id});  // der skal være en entry fordi person er manager  
            Trips.find({vehicleId: {$in:groups}})
            .populate('personId')
            .populate('vehicleId')
            .populate({path : 'vehicleId', populate : {path : 'inGroup'}})
            .exec(function (err, resp) {
                if (err) { return next(err); }
                res.json(resp);
            });
      });


    })

	.post( Verify.verifyOrdinaryUser, function (req, res, next) {
        Trips.create(req.body, function (err, resp) {
            if (err) { console.log("ERROR",err);return next(err); }
            var id = resp._id;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.end('Added the trip with id: ' + id);
        });
    })

    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        Trips.remove({}, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });

tripRouter.route('/person/:personId')
    .get(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson, function (req, res, next) {
        if (req.decoded._doc.person._id != req.params.personId) {
            return next("You are not allowed");
        }

        Trips.find({personId: req.params.personId})
        .populate('personId')
        .populate('vehicleId')
        .populate({path : 'vehicleId', populate : {path : 'inGroup'}})
        .exec(function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });

tripRouter.route('/month/:monthNo')
    .get(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager,function (req, res, next) {
        let month = Number(req.params.monthNo)%100;
        let year  = Math.floor((Number(req.params.monthNo)-month)/100+0.5);
        let start  = new Date(year.toString()+"-"+month.toString()+"-01");
        let slut   = new Date(year.toString()+"-"+(month+1).toString()+"-01");

        Trips.aggregate([
            { $match: {$and: [{dateTo: {$gte: start}}, {dateFrom: {$lt: slut}}]}},
            {$group: {_id: "$vehicleId",total: {$sum:"$tripLength"}}}
            ], function (err, resp) {
                if (err) {console.log(err); return next(err); }
                Vehicles.populate(resp, {path: "_id"},function (err, resp) {
                    if (err) {console.log(err); return next(err); }
                    res.json(resp);
                });
        });
    });

tripRouter.route('/:tripId')
   .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        Trips.findOne({_id: req.params.tripId})
            .populate('personId')
            .populate('vehicleId')
            .populate({path : 'vehicleId', populate : {path : 'inGroup'}})
//            .populate('comments.postedBy')
            .exec(function (err, resp) {
                if (err) { return next(err); }
                console.log(resp)
                res.json(resp);
            });
    })

    .put(Verify.verifyOrdinaryUser, function (req, res, next) {
        Trips.findByIdAndUpdate(req.params.tripId, {
            $set: req.body
        }, {
            new: true
        }, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })
	
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Trips.findByIdAndRemove(req.params.tripId, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });


module.exports = tripRouter;