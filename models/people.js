// leadership.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var personSchema = new Schema({
 
    firstname: {
        type: String,
        required: true
    },
    familyname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    telephoneCountry: {
        type: Number,
    },
    telephone: {
        type: String,
    },
    email: {
        type: String,
        required: false,
//        unique: true
    },
    workLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
//        required: true
    },
    
    inGroup: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    managerOfGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],

    isTopManager: {
        type: Boolean,
        required: true,
    },
    isProspect: {
        type: Boolean,
        required: true,
    },
    isHistoric: {
        type: Boolean,
        required: true,
    }
}, {
    timestamps: true
});

var People = mongoose.model('Person', personSchema);

module.exports = People;
