const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploader = (file) => {
  return new Promise(function (resolve, reject) {
    cloudinary.uploader
      .upload_stream({ public_id: file.publicId }, function (error, result) {
        if (error) {
          return reject(error);
        }
        resolve(result);
      })
      .end(file.data);
  });
};
