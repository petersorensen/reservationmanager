// locations.js

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var locationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var Locations = mongoose.model('Location', locationSchema);

module.exports = Locations;