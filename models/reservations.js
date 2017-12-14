// locations.js

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var reservationSchema = new Schema({
    purpose: {
        type: String,
        required: true
    },
    dateFrom: {
        type: Date,
        required: true
    },
    dateTo: {
        type: Date,
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
    }
}, {
    timestamps: true
});

var Reservations = mongoose.model('Reservation', reservationSchema);

module.exports = Reservations;