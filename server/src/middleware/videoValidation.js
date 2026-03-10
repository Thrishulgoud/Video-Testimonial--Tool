const validateVideoUpload = (req, res, next) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Title, description, and category are required' });
  }

  if (title.length < 3 || title.length > 100) {
    return res.status(400).json({ message: 'Title must be between 3 and 100 characters' });
  }

  if (description.length < 10 || description.length > 2000) {
    return res.status(400).json({ message: 'Description must be between 10 and 2000 characters' });
  }

  const validCategories = ['Education', 'Entertainment', 'Gaming', 'Music', 'Tech', 'Sports', 'Other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  next();
};

module.exports = {
  validateVideoUpload
};