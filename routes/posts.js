const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// ---------- MULTER SETUP ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ----------------- ROUTES -----------------

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .populate("comments.author", "username");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username")
      .populate("comments.author", "username");
    if (!post) return res.status(404).json({ msg: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// CREATE new post
// Support multipart/form-data (with optional image) and JSON bodies
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  console.log('POST /api/posts body:', req.body);
  const { title, content } = req.body || {};
  if (!title || !content)
    return res.status(400).json({ msg: "Title and content required" });

  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    const newPost = new Post({
      title,
      content,
      author: req.userId,
      image: imagePath,
    });

    console.log('New Post object:', newPost);
    await newPost.save();
    const savedPost = await Post.findById(newPost._id).populate(
      "author",
      "username"
    );
    res.json(savedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE a post
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Only the author can update
    if (!post.author || post.author.toString() !== req.userId)
      return res.status(401).json({ msg: "Unauthorized" });

    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (req.file) post.image = `/uploads/${req.file.filename}`;

    await post.save();
    const updatedPost = await Post.findById(post._id).populate("author", "username");
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE a post
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); 
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Only the author can delete
    if (!post.author || post.author.toString() !== req.userId)
      return res.status(401).json({ msg: "Unauthorized" });

    await post.deleteOne(); 
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("DELETE /posts/:id error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
