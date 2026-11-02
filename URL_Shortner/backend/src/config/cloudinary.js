const { v2: cloudinary } = require("cloudinary");
const ApiError = require("../utils/ApiError");

const requiredConfiguration = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];

const getCloudinary = () => {
    if (requiredConfiguration.some((name) => !process.env[name])) {
        throw new ApiError(503, "QR code service is unavailable");
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
    return cloudinary;
};

module.exports = { getCloudinary };
