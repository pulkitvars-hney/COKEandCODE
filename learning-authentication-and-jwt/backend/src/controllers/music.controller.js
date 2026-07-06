const musicmodel = require('../models/artist.models');
const jwt = require('jsonwebtoken');
const albummodel = require('../models/album.models');

const { uploadfile } = require('../services/storage.services');
// every user gets a token and by token we can identify the user and his role and based on that we can give access to the user to create music or not
async function createMusic(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    // jwt.verify(token, process.env.jwt_secret, async (err, decoded) => {
    //     if (err) {
    //         return res.status(401).json({ message: 'Unauthorized' });
    //     }
    //     if (decoded.role !== 'admin') {
    //         return res.status(403).json({ message: 'Forbidden' });
    //     }
    //     const { title, artist } = req.body;
    //     const uri = req.file;

    //     const result = await uploadfile(uri.buffer.toString('base64'), uri.originalname);

    //     const music = await musicmodel.create({
    //         uri: result.url,
    //         title,
    //         artist: decoded.id,
    //     });
    //     res.status(201).json(music);
    // });
    //? this is a very bad way to check that the token is valid or not because jwt.verify itself does not know or care that your callback is async.
    //? It just calls the callback and moves on — it doesn't wait for your await statements to finish.
    //? so we can use try catch block to handle the error and send the response to the user
    try {
        const decoded = jwt.verify(token, process.env.jwt_secret);
       if(decode.role!=='admin'){
        return res.status(403).json({ message:"Forbidden you are not allowed to create music" });
       }
       const { title, artist } = req.body;
       const uri = req.file;
       const result = await uploadfile(uri.buffer.toString('base64'), uri.originalname);
       const music = await musicmodel.create({
        uri: result.url,
        title,
        artist: decoded.id,
       });
       res.status(201).json(music);
    }
    catch (err) {
        return res.status(401).json({ message: 'Unauthorized or error occurred' });
    }
}
async function createAlbum(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Please login to create an album' });
    }
    // jwt.verify(token, process.env.jwt_secret, async (err, decoded) => {
    //     if (err) {
    //         return res.status(401).json({ message: 'Unauthorized' });
    //     }
    //     if (decoded.role !== 'admin') {
    //         return res.status(403).json({ message: 'Forbidden you are not allowed to create an album' });
    //     }
    //     const { title, musicid } = req.body;
    //     const album = await albummodel.create({
    //         title,
    //         music: musicid,
    //         artist: decoded.id
    //     });
    //     res.status(201).json({
    //         message: 'Album created successfully',
    //         album: {
    //             id: album._id,
    //             title: album.title,
    //             music: album.music,
    //             artist: album.artist
    //         }
    //     });
    //! this is a very bad way to check that the token is valid or not because jwt.verify itself does not know or care that your callback is async.
    // ! It just calls the callback and moves on — it doesn't wait for your await statements to finish.
    //! so we can use try catch block to handle the error and send the response to the user
    try {
        const decoded = jwt.verify(token, process.env.jwt_secret);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden you are not allowed to create an album' });
        }
        const { title, musicid } = req.body;
        const uri=req.file;
        const result = await uploadfile(uri.buffer.toString('base64'), uri.originalname);
        const music =await musicmodel.create({
            uri:result.uri,
            title,
            artist:decoded.id
        })
    }
        catch (err) {
            return res.status(401).json({ message: 'Unauthorized or error occured' });
        }
    }
module.exports = { createMusic, createAlbum };
