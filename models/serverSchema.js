const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: String,
  ip: String,
  banner: String,
  port: {
    type: Number,
    default: 25565,
  },
  location: {
    type: String,
    default: "UK",
  },
  version: String,
  edition: String,
  playerCount: String,
  successfulPings: {
    type: Number,
    default: 0,
  },
  totalPings: {
    type: Number,
    default: 0,
  },
  uptime: {
    type: String,
    default: "0%",
  },
  port: {
    type: Number,
    default: 25565
  },
  description: String,
  ownerID: String,
  onlineStatus: Boolean,
  upvotes: {
    type: Number,
    default: 0
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  dateUpdated: {
    type: Date,
    default: Date.now,
  },
  lastPinged: {
    type: Date,
    default: Date.now,
  },
});

const Server = mongoose.model('Server', serverSchema);

module.exports = Server;
