const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const session = require("express-session");

router.post("/register", async (req, res) => {
  if (!req.body.username) {
    res.render("account/register");
  } else {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // Create a new user
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      // Save the user to the database
      await user.save();

      req.session.user = {
        id: user.id,
        username: user.username,
      };

      // Send a success response
      res.redirect("/account/register?success=true");
    } catch (error) {
      // Send a failure response
      res.status(400).send(error.message);
    }
  }
});

router.get("/register", async (req, res) => {
  res.render("account/registration-success");
});

router.get("/logout", (req, res) => {
  if (typeof req.query.success !== "undefined") {
    if (req.query.success === "true") {
      res.render("account/logout-success");
      return;
    } else {
      res.render("account/logout-success", { err: "Something went wrong" });
      return;
    }
  }

  if (typeof req.session != "undefined") {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.send("Error logging out");
        return;
      }
    });

    res.redirect("/account/logout?success=true");
  } else {
    res.redirect("/account/logout?success=false");
  }
});

router.get("/logout", (req, res) => {
  if (typeof req.session != "undefined") {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.send("Error logging out");
        return;
      }
    });

    res.render("account/logout-success");
  } else res.send("You are already logged out?");
});

//CALLED FOR LOGIN PAGE, MAY HAVE AN ORIGIN QUERY, MAY HAVE ACCESS DENIED ERROR
router.get("/login", async (req, res) => {
  //USER ALREADY LOGGED IN
  if (typeof req.session != "undefined" && req.session.hasOwnProperty("user")) {
    //ADD REDIRECT IF PRESENT
    return res.redirect("/");
  } 
  //DISPLAY ACCESS DENIED ERROR MESSAGE IF SPECIFIED
  else if (req.query.access === "false") {
    res.render("account/login", { msg: "You need to be logged in to do that", origin:  req.query.origin });
  } 
  //SIMPLE LOGIN PAGE
  else {
    res.render("account/login", { origin:  req.query.origin });
  }
});

//CALLED FOR LOGIN PAGE, OR ATTEMPTED LOGIN
router.post("/login", async (req, res) => {
  //NO FORM INPUT SO NO LOGIN ATTEMPTED
  if (!req.body.username) {
    res.render("account/login", { origin:  req.query.origin});
    return;
  }

  //OTHERWISE LOGIN ATTEMPTED
  try {
    //TRY AND FIND USERNAME OR EMAIL IN DATABASE
    user = await User.findOne({ username: req.body.username });
    if (!user) {
      user = await User.findOne({ email: req.body.username });
      if (!user) {
        //USER NOT FOUND
        res.render("account/login", { err: "user or password incorrect", origin:  req.query.origin });
        return;
      }
    }

    //USER HAS BEEN FOUND, SO COMPARE THE PASSWORDS
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      res.render("account/login", { err: "user or password incorrect", origin:  req.query.origin });
      return;
    }

    //USER VALIDATED, UPDATE THINGS
    user.lastSeen = Date.now;
    req.session.user = {
      id: user.id,
      username: user.username,
    };

    target = '/'
    if (typeof req.query.origin !== 'undefined'){
      target = decodeURIComponent(req.query.origin)
    }
    console.log(req.query.origin)
    res.render("account/login-success", { target });

  } catch (err) {
    console.log(err);
    res.render("account/login", { err, origin:  req.query.origin });
  }
});

router.get("/", async (req, res) => {
  if (req.query.id) {
    const userid = req.query.id;
    User.findById(userid, (err, user) => {
      if (err) {
        console.log(err);
      }
      res.send(user);
      //res.render("account/user", { user });
    });
  }
});

module.exports = router;
