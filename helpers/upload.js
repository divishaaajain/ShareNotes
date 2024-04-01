const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: `${process.env.CLOUD_NAME}`,
    api_key: `${process.env.CLOUD_API_KEY}`,
    api_secret: `${process.env.CLOUD_API_SECRET}`,
});

const fileUpload = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        if (result) {
            return result;
        }
        throw err;
    } catch (err) {
        throw err;
    }
}

module.exports = {fileUpload};