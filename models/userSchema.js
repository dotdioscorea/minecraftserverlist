const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  serverIDs: [{
    type: String
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
