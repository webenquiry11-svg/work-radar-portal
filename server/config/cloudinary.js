const cloudinary = require('cloudinary').v2;
const { randomUUID } = require('node:crypto');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = {
  _handleFile(req, file, callback) {
    let completed = false;
    const finish = (error, info) => {
      if (completed) return;
      completed = true;
      callback(error, info);
    };

    const uploadStream = cloudinary.uploader.upload_stream({
      folder: 'employee-profiles',
      format: 'png',
      public_id: `${file.fieldname}-${Date.now()}-${randomUUID()}`,
    }, (error, result) => {
      if (error) return finish(error);
      finish(null, {
        filename: result.public_id,
        path: result.secure_url,
        size: result.bytes,
      });
    });

    file.stream.once('error', error => {
      uploadStream.destroy(error);
      finish(error);
    });
    uploadStream.once('error', finish);
    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, callback) {
    cloudinary.uploader.destroy(file.filename, error => {
      if (error) return callback(error);
      delete file.filename;
      delete file.path;
      callback(null);
    });
  },
};

module.exports = { cloudinary, storage };
