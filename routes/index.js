const express = require("express");
const router = express.Router();
const Server = require("../models/serverSchema");
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const moment = require('moment')

router.get("/", async (req, res) => {
  Server.find({}).sort({ upvotes: -1 }).limit(10).exec(async (err, servers) => {
    if (err) {
      return res.status(500).send(err);
    }
    for (let i = 0; i < servers.length; i++) {
      try {
        user = await User.findById(servers[i].ownerID);
        servers[i].owner = user.username;
      }
      catch (error) {}
    }

    res.render("home", { servers, moment });
  });
});

// Handle search requests
router.get("/search", async (req, res) => {
  const searchQuery = req.query.query;
  console.log(searchQuery);

  Server.find({ name: new RegExp(searchQuery, "i") }, (err, servers) => {
    if (err) {
      // Handle any errors
      console.log(err);
      return res.send("An error occurred while searching for servers");
    }
    // Render the search results page
    res.render("search", { searchQuery, servers});
  });
});

module.exports = router;
