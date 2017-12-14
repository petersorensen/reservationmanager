// leadership.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var vehicleSchema = new Schema({
    plate: {
        type: String,
        required: true,
        unique: true
    },
    brand: {
        type: String,
        required: false
    },
    model: {
        type: String,
        required: false,
    },
    seats: {
        type: Number,
        required: false,
    },
    description: {
        type: String,
        required: false
    },
    inGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: false
    },
    kmPresent: {
        type: Number,
        required: false,
    },
    lastMaintenanceKm: {
        type: Number,
        required: false
    },
    lastMaintenanceDate: {
        type: Date,
        required: false,
    },
    nextMaintenanceKm: {
        type: Number,
        required: false
    },
    nextMaintenanceDate: {
        type: Date,
        required: false,
    },
    carFirstRegistrated: {
        type: Date,
        required: false,
    },
}, {
    timestamps: true
});

var Vehicles = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicles;
