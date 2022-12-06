const express = require('express');
const router = express.Router();
const Server = require('../models/server');

// Define the route for submitting a new server
router.post('/submit', (req, res) => {
  // Validate the submitted data
  const name = req.body.name;
  const ip = req.body.ip;
  const description = req.body.description;
  console.log(req)
  if (!name || !ip || !description) {
    return res.status(400).send('Missing required fields');
  }

  // Save the server to the database
  const server = new Server({ name, ip, description });
  server.save((err) => {
    if (err) {
      console.log(err); // Add this line
      return res.status(500).send(err);
    }
    console.log('Server added successfully with id' + server._id);
    return res.redirect(`/server/submission-success?_id=${server._id}`);
  });
});

// Show the submission successful page
router.get('/submission-success', (req, res) => {
  const title = 'Submission Successful';
  const id = req.query._id; // Get the server details from the query parameters
  res.render('server/server-submission-success', { title, id }); // Render the template
});


router.get('/list', (req, res) => {
  Server.find({}, (err, servers) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.json(servers);
  });
});

router.get('/:id/status', (req, res) => {
  const serverId = req.params.id;
  Server.findById(serverId, (err, server) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!server) {
      return res.status(404).send('Server not found');
    }
    // Check if the server is online
    // ...
    return res.json({ status: 'Online' });
  });
});

router.post('/:id/upvote', (req, res) => {
  const serverId = req.params.id;
  Server.findById(serverId, (err, server) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!server) {
      return res.status(404).send('Server not found');
    }
    // Update the upvote count for the server
    server.upvotes += 1;
    server.save((err) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send('Upvote added successfully');
    });
  });
});


router.get('/server-submit', (req, res) => { // Define the route for the server submission page
    res.render('server/server-submit'); // Render the server-submit template
  });

// Delete a server
router.get('/delete/:id', (req, res) => {
  const id = req.params.id; // Get the server id from the URL
  Server.findByIdAndDelete(id, (err) => { // Find and delete the server
    if (err) {
      console.log(err); // Log any errors
      return res.send('Error deleting server'); // Return an error message
    }
    console.log('Server deleted successfully');
    return res.redirect('/server-list'); // Redirect the user to the server list page
  });
});


module.exports = router;
