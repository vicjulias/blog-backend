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

    // Reload the post and return the newly added comment with author.username
    const updatedPost = await Post.findById(req.params.postId).populate(
      'comments.author',
      'username'
    );

    const newComment = updatedPost.comments[updatedPost.comments.length - 1];
    res.json({ comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
