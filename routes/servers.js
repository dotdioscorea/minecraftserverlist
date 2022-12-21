const express = require("express");
const router = express.Router();
const Server = require("../models/serverSchema");
const User = require("../models/userSchema");
const moment = require('moment')
const ssc = require("../helpers/server-status-checker");

// Show the submission successful page
router.get("/submission-success", (req, res) => {
  const title = "Submission Successful";
  res.render("servers/submission-success", req.server); // Render the template
});

router.get("/server-submit", (req, res) => {
  if (typeof req.session != 'undefined' && req.session.hasOwnProperty('user'))
    res.render("servers/server-submit"); // Render the server-submit template
  else
    res.redirect("/account/login?access=false&origin=" + encodeURIComponent("/servers/server-submit"))
});

router.get("/:serverid", async (req, res) => {

  // Update the URL pattern for the server page route
  const serverid = req.params.serverid;
  Server.findById(serverid, async (err, server) => {
    user = await User.findById(server.ownerID)
    server.owner = user.username
    // Find the server with the specified ID
    if (err) {
      res.send(err);
    } else {
      res.render("servers/server-page", { server, moment }); // Render the server-page template and pass the server data
    }
  });
});

module.exports = router;