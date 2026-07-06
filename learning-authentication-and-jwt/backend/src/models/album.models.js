const mongoose = require('mongoose');
const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    musics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'music'
    }],
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
});
const Album = mongoose.model('Album', albumSchema);
module.exports = Album;
    
