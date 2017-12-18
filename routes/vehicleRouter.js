//extRouter

var dboper = require('./operations');

// skal kunne 
//   give alle vehicles
//   give bestemt vehicle udfra id
//   søgning ud fra string

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Vehicles = require('../models/vehicles');

var vehicleRouter = express.Router();
vehicleRouter.use(bodyParser.json());

var Verify = require('./verify');

Array.prototype.removeDuplicates = function (){
    var temp=new Array();
    this.sort();
    for(i=0;i<this.length;i++){
        if(this[i]==this[i+1]) {continue}
        temp[temp.length]=this[i];
        }
    return temp;
}

// Example:
// var uniqueArray = a.removeDuplicates();

function eliminateDuplicates(arr) {
    var i;
    var len=arr.length;
    var out=[];
    var obj={};

    for (i=0;i<len;i++) {
        if (!obj[arr[i]])
        {
            obj[arr[i]]={};
            out.push(arr[i]);
        }
    }
    return out;
}

vehicleRouter.route('/')
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
        .populate('inGroup')
        .populate({path : 'inGroup', populate : {path : 'locationId'}})
        .exec(function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })

    .post(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson,Verify.verifyManager, function (req, res, next) {
//        console.log("NEW VEHICLE ", req.body)
        Vehicles.create(req.body, function (err, resp) {
            if (err) { return next(err); }
            console.log('Vehicle inserted!',resp.brand,resp.model);
            res.json(resp);
        });
    })

    .delete(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson, Verify.verifyAdmin, function (req, res, next) {
        Vehicles.remove({}, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });


vehicleRouter.route('/:vehicleId')
   .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        console.log("Finder vehicle")
        console.log(req.params.vehicleId)
        Vehicles.findOne({_id: req.params.vehicleId})
        .populate('inGroup')
        .populate({path : 'inGroup', populate : {path : 'locationId'}})
            .exec(function (err, resp) {
                if (err) { return next(err); }
//                vehicleDateConverter(resp);
                console.log(resp)
                res.json(resp);
            });
    })

    .put(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson, Verify.verifyManager, function (req, res, next) {
        Vehicles.findByIdAndUpdate(req.params.vehicleId, {
            $set: req.body
        }, {
            new: true
        }, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    })
    
    .delete(Verify.verifyOrdinaryUser,Verify.getVerifiedPerson, Verify.verifyAdmin, function (req, res, next) {
        Vehicles.findByIdAndRemove(req.params.vehicleId, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });


module.exports = vehicleRouter;