const fs = require('fs').promises;
const path = require('path');

const uploadToLocal = async (file, key) => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Create a unique filename
    const filename = key.split('/').pop();
    const filepath = path.join(uploadsDir, filename);

    // If file is a buffer, write it directly
    if (Buffer.isBuffer(file)) {
      await fs.writeFile(filepath, file);
    }
    // If file has a path (from multer), move it
    else if (file.path) {
      await fs.rename(file.path, filepath);
    }
    // If file has a buffer property
    else if (file.buffer) {
      await fs.writeFile(filepath, file.buffer);
    }

    // Return local URL
    return `/uploads/${filename}`;
  } catch (error) {
    throw new Error(`Error saving file locally: ${error.message}`);
  }
};

const deleteFromLocal = async (key) => {
  try {
    const filename = key.split('/').pop();
    const filepath = path.join(__dirname, '../../uploads', filename);
    await fs.unlink(filepath);
  } catch (error) {
    throw new Error(`Error deleting local file: ${error.message}`);
  }
};

module.exports = {
  uploadToLocal,
  deleteFromLocal
};