const mongoose = require('mongoose');

const artistSchema= new mongoose.Schema({
    uri: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]
})
module.exports = mongoose.model('Artist', artistSchema);