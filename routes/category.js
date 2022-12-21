const express = require('express');
const router = express.Router();
const categories = require('../categories');
const Server = require("../models/serverSchema");

const getServersByCategory = (category) => {
  return Server.find({ categories: category }).sort({ upvotes: -1 });
}

// Route to display a category page
router.get('/:category', (req, res) => {
  const category = req.params.category;
  const title = category;
  const description = categories[category];  // Get the description from the categories object
  getServersByCategory(category)
    .then((servers) => {
      res.render('category', { title, description, servers });  // Pass the title, description, and servers to the template
    })
    .catch((err) => res.sendStatus(500));
});

module.exports = router;
