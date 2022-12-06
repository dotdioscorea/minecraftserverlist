const express = require('express');
const router = express.Router();
const Server = require('../models/server');

router.get('/server-list', (req, res) => {
  Server.find({}, (err, servers) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.render('server-list', { servers });
  });
});

router.get('/servers/:serverid', (req, res) => { // Update the URL pattern for the server page route
  const serverid = req.params.serverid;
  Server.findById(serverid, (err, server) => { // Find the server with the specified ID
    if (err) {
      res.send(err);
    } else {
      res.render('servers/server-page', { server }); // Render the server-page template and pass the server data
    }
  });
});

// Handle search requests
router.get("/search", (req, res) => {
  // Get the search query from the request
  const searchQuery = req.query.query;
  console.log(searchQuery);

  // Search the database for servers with names that match the search query
  Server.find({ name: new RegExp(searchQuery, "i") }, (err, servers) => {
    if (err) {
      // Handle any errors
      console.log(err);
      return res.send("An error occurred while searching for servers");
    }

    // Render the search results page
    res.render("server/search-results", { searchQuery, servers});
  });
});

module.exports = router;
