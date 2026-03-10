const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { s3, uploadToS3 } = require('../config/s3');
const config = require('../config/config');

class VideoProcessor {
  static async generateThumbnail(inputPath) {
    const thumbnailPath = path.join('/tmp', `${uuidv4()}.jpg`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '320x240'
        })
        .on('end', async () => {
          try {
            const thumbnailBuffer = fs.readFileSync(thumbnailPath);
            const thumbnailKey = `thumbnails/${path.basename(thumbnailPath)}`;
            const thumbnailUrl = await uploadToS3({
              buffer: thumbnailBuffer,
              mimetype: 'image/jpeg'
            }, thumbnailKey);
            
            // Cleanup
            fs.unlinkSync(thumbnailPath);
            resolve(thumbnailUrl);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => reject(err));
    });
  }

  static async processVideo(inputPath, videoId) {
    const outputPath = path.join('/tmp', `${uuidv4()}.mp4`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-movflags frag_keyframe+empty_moov',
          '-c:a aac',
          '-f mp4'
        ])
        .output(outputPath)
        .on('end', async () => {
          try {
            const processedVideo = fs.readFileSync(outputPath);
            const videoKey = `videos/${videoId}/processed.mp4`;
            const videoUrl = await uploadToS3({
              buffer: processedVideo,
              mimetype: 'video/mp4'
            }, videoKey);
            
            // Cleanup
            fs.unlinkSync(outputPath);
            resolve(videoUrl);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => reject(err))
        .run();
    });
  }

  static async getDuration(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(Math.floor(metadata.format.duration));
      });
    });
  }
}

module.exports = VideoProcessor;