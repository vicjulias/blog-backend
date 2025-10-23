const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();
const app = express();

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); 

// ---------- ROUTES ----------
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// ---------- MONGODB CONNECTION ----------
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
