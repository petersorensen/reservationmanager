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

var Reservations = require('../models/reservations');
var Vehicles = require('../models/vehicles');

var reservationRouter = express.Router();
reservationRouter.use(bodyParser.json());

var Verify = require('./verify');

reservationRouter.route('/')
    .get(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
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

            let groups = resp.map(function(y){return y._id});   // der skal være en entry fordi person er manager    
            Reservations.find({vehicleId: {$in:groups}})
            .populate('personId')
            .populate('vehicleId')
            .populate({path : 'vehicleId', populate : {path : 'inGroup'}})
            .exec(function (err, resp) {
                if (err) { return next(err); }
                res.json(resp);
            });
        });
    })

	.post(Verify.verifyOrdinaryUser, function (req, res, next) {
//        console.log(req.body);
        Reservations.create(req.body, function (err, resp) {
            if (err) { return next(err); }
//            console.log('Reservation inserted!');
            var id = resp._id;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.end('Added the reservation with id: ' + id);
        });
    })

    .delete(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
        Reservations.remove({}, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });

reservationRouter.route('/person/:personId')
    .get(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson, function (req, res, next) {
        if (req.decoded._doc.person._id != req.params.personId) {
            return next("You are not allowed");
        }

        Reservations.find({personId: req.params.personId})
        .populate('personId')
        .populate('vehicleId')
        .populate({path : 'vehicleId', populate : {path : 'inGroup'}})
        .exec(function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });



reservationRouter.route('/:reservationId')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
//        People.findById(req.params.personId)
        console.log("Finder reservation")
        console.log(req.params.reservationId)
        Reservations.findOne({_id: req.params.reservationId})
            .populate('personId')
            .populate('vehicleId')
            .populate({path : 'vehicleId', populate : {path : 'inGroup'}})
            .exec(function (err, resp) {
                if (err) { return next(err); }
                console.log(resp)
                res.json(resp);
            });
    })

    .put(Verify.verifyOrdinaryUser, function (req, res, next) {
        Reservations.findByIdAndUpdate(req.params.reservationId, {
            $set: req.body
        }, {
            new: true
        }, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })
	
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Reservations.findByIdAndRemove(req.params.reservationId, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });


module.exports = reservationRouter;