const {ImageKit}= require('@imagekit/nodejs/index.js');

const imagekitInstance = new ImageKit({
    privateKey: process.env.imagekit_private_key,
})
async function uploadfile(file, filename)  {
    const result = await imagekitInstance.files.upload({
        file,
        fileName: "music_" + Date.now() + ".jpg",
        folder: "/music",
    });
    return result;
}
module.exports = { uploadfile };