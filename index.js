const ejsLayouts = require("express-ejs-layouts");
const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const https = require('https');
const fs = require('fs');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const serverRouter = require("./routes/servers");
const categoryRouter = require("./routes/category");
const apiRouter = require("./routes/api");
const indexRouter = require("./routes/index");
const accountRouter = require("./routes/account");
const serverStatusChecker = require("./helpers/server-status-checker")
const userSchema = require("./models/userSchema");
const categories = require('./categories');

// Connect to the MongoDB database
mongoose.connect("mongodb://localhost/minecraft-servers", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(bodyParser.json()); // Use the body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.use(cookieParser());

app.set("view engine", "ejs"); // Set the view engine to ejs

app.use(session({
  secret: 'my-secret', // a secret key to sign the session ID cookie
  resave: false,
  saveUninitialized: true
}));


app.use((req, res, next) => {
  if (typeof req.session != 'undefined' && req.session.hasOwnProperty('user')) {
    app.locals.user = { username: req.session.user.username };
  } else {
    app.locals.user = null;
  }

  app.locals.categories = categories;
  next();
});

app.use(express.json());
app.use(express.static(__dirname + "/public")); // Register the public directory as a static directory
app.use('/banners', express.static(__dirname + '/banners'));
app.use("/servers", serverRouter);
app.use("/account", accountRouter);
app.use("/category", categoryRouter);
app.use("/api", apiRouter);
app.use("/", indexRouter);

app.use(function (req, res, next) {
  res.status(404).send("<h1>Sorry nothing found!<h1>");
});

serverStatusChecker.startCheckingServers();

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// const options = {
//   // key: fs.readFileSync('server.key'),
//   // cert: fs.readFileSync('server.cert')
// };
// https.createServer(options, app).listen(443);