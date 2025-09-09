const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const authMiddleware = require('../middleware/auth');

// ADD a comment
router.post('/:postId', authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ msg: 'Comment text required' });

  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username')
      .populate('comments.author', 'username');

    if (!post) return res.status(404).json({ msg: 'Post not found' });

    post.comments.push({ text, author: req.userId });
    await post.save();

    const updatedPost = await Post.findById(req.params.postId)
      .populate('author', 'username')
      .populate('comments.author', 'username');

    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
