// locations.js

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var tripSchema = new Schema({
    dateFrom: {
        type: Date,
        required: true
    },
    dateTo: {
        type: Date,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    tripLength: {
        type: Number,
        required: true
    },
    personCount: {
        type: Number,
        required: true
    },
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var Trips = mongoose.model('Trip', tripSchema);

module.exports = Trips;