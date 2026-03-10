const AWS = require('aws-sdk');
const config = require('./config');

const s3 = new AWS.S3({
  accessKeyId: config.AWS.accessKeyId,
  secretAccessKey: config.AWS.secretAccessKey,
  region: config.AWS.region
});

const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: config.AWS.bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw new Error(`Error uploading to S3: ${error.message}`);
  }
};

const deleteFromS3 = async (key) => {
  const params = {
    Bucket: config.AWS.bucketName,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    throw new Error(`Error deleting from S3: ${error.message}`);
  }
};

module.exports = {
  s3,
  uploadToS3,
  deleteFromS3
};