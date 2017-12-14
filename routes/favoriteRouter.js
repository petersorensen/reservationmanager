// favoriteRouter.js

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

var Verify = require('./verify');

favoriteRouter.route('/')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
                console.log('PHS TEST3');
        Favorites.find({'postedBy': req.decoded._doc._id})
            .populate('dishes')
            .populate('postedBy')
            .exec(function (err, favorites) {
                if (err) { return next(err); }
                        console.log('PHS TEST4');
                res.json(favorites);
            });
    })
    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        console.log('PHS TEST1');
console.log(req.body._id);
        Favorites.findOne({'postedBy': req.decoded._doc._id}, function (err, favorite) {
  //      Favorites.findById(req.decoded._doc._id, function (err, favorite) {
              if (err) { return next(err); }
            if (!favorite) {
                Favorites.create(req.body, function (err, favorite) {
                    if (err) { return next(err); }
                    console.log('Favorite created!');
                    favorite.postedBy = req.decoded._doc._id;
                    favorite.dishes.push(req.body._id);
                    favorite.save(function (err, favorite) {
                        if (err) { return next(err); }
                        res.json(favorite);
                    });
                });
            } else {
                var dish = req.body._id;

                if (favorite.dishes.indexOf(dish) == -1) {
                    favorite.dishes.push(dish);
                }
                favorite.save(function (err, favorite) {
                    if (err) { return next(err); }
                    res.json(favorite);
                });
            }
        });
    })

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorites.remove({'postedBy': req.decoded._doc._id}, function (err, resp) {
            if (err) { return next(err); }
            res.json(resp);
        });
    });

favoriteRouter.route('/:dishId')

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
                console.log('single postedBy: ' +req.decoded._doc._id)
        Favorites.findOneAndUpdate({'postedBy': req.decoded._doc._id},
                   {$pull: {dishes: req.params.dishId}}, function (err, favorite) {
            if (err) { return next(err); }
            Favorites.findOne({'postedBy': req.decoded._doc._id}, function(err, favorite){
                res.json(favorite);
            });
        });
    });


module.exports = favoriteRouter;