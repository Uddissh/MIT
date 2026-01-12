const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    name: String,
    avatar: String
  },
  content: {
    type: String,
    required: true
  },
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video'] }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiModerated: {
    type: Boolean,
    default: false
  },
  aiFlags: [{
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'safe']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);