const mongoose = require('mongoose');
const { Schema } = mongoose;

const AssessmentSchema = new Schema({
    age: {
        type: String,
        required: true
    },
    skintype: {
        type: String,
        required: true
    },
    skintone: {
        type: String,
        required: true
    },
    sun: {
        type: String,
        required: true
    },
    sleeptime: {
        type: String,
        required: true
    },
    skinconcern: {
        type: String,
        required: true
    },
});

const Assessment = mongoose.model('assessment', AssessmentSchema);
module.exports = Assessment;