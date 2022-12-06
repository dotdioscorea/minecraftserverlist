const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // Import the body-parser package
const serverRoutes = require('./routes/server');
const indexRouter = require('./routes/index');
const ejs = require('ejs'); // Import the ejs module
const ejsLayouts = require('express-ejs-layouts');

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost/minecraft-servers', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.use(bodyParser.json()); // Use the body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.use(ejsLayouts);

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Register the public directory as a static directory
app.use(express.static(__dirname + '/public'));

// Use the JSON parser for handling requests with JSON bodies
app.use(express.json());

// Use the server routes for handling requests to the /server path
app.use('/server', serverRoutes);
app.use('/', indexRouter);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
