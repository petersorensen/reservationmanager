// locations.js

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var groupSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    historic: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

var Groups = mongoose.model('Group', groupSchema);

module.exports = Groups;