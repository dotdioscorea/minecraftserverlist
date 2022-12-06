const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: String,
  ip: String,
  description: String,
  upvotes: {
    type: Number,
    default: 0
  },
    dateAdded: {
    type: Date,
    default: Date.now,
  },
});

const Server = mongoose.model('Server', serverSchema);

module.exports = Server;
