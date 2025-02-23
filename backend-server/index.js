const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./server.config'); // Import config file
const cors = require('cors');

const app = express();
app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to MongoDB using the URI from config
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a Mongoose schema and model for a Blog
const blogSchema = new mongoose.Schema({
  url: { type: String, unique: true, required: true },
  registeredAt: { type: Date, default: Date.now },
  nationality: { type: String },
  state: { type: String },
  extraTags: { type: [String] },
  summary : { type: String }
});

const Blog = mongoose.model('Blog', blogSchema);

app.get('/filters', async (req, res) => {
    try {
      const states = await Blog.distinct("state");
      const tags = await Blog.distinct("extraTags");
      console.log(states, tags);
      res.json({ states, tags });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Endpoint to register a new blog URL with additional data
app.post('/add', async (req, res) => {
  const { url, nationality, state, extraTags, summary } = req.body;
  console.log(req.body);

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const existingBlog = await Blog.findOne({ url });
    if (existingBlog) {
      return res.status(400).json({ error: 'URL already registered' });
    }

    const blog = new Blog({ url, nationality, state, extraTags, summary });
    await blog.save();

    res.status(201).json({ message: 'Blog registered successfully', blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to check if a blog URL is already present
app.get('/exists', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL query parameter is required' });
  }

  try {
    const blog = await Blog.findOne({ url });
    res.json({ exists: !!blog, blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to search blogs with filtering options
app.get('/search', async (req, res) => {
  const { states, tags, summary } = req.query;
  let filter = {};

  if (states) {
    filter.state = { $in: states.split(',').map(s => s.trim()) };
  }

  if (tags) {
    filter.extraTags = { $in: tags.split(',').map(s => s.trim()) };
  }

  // if (keyword) {
  //   filter.$or = [
  //     { nationality: { $regex: keyword, $options: 'i' } },
  //     { state: { $regex: keyword, $options: 'i' } },
  //     { extraTags: { $elemMatch: { $regex: keyword, $options: 'i' } } }
  //   ];
  // }

  try {
    const blogs = await Blog.find(filter).limit(config.maxResults);
    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
