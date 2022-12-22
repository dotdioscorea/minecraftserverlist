const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const Server = require("../models/serverSchema");
const bcrypt = require("bcrypt");
const moment = require("moment");

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
  //LOGIN SUCCESS
  if (
    (typeof req.session != "undefined" && req.session.hasOwnProperty("user")) ||
    req.query.success
  ) {
    target = "/";
    if (typeof req.query.origin !== "undefined") {
      target = decodeURIComponent(req.query.origin);
    }
    res.render("account/login-success", { target });
  }
  //DISPLAY ACCESS DENIED ERROR MESSAGE IF SPECIFIED
  else if (req.query.access === "false") {
    res.render("account/login", {
      err: "You need to be logged in to do that",
      origin: req.query.origin,
    });
  }
  //SIMPLE LOGIN PAGE
  else {
    res.render("account/login", { origin: req.query.origin });
  }
});

//CALLED FOR LOGIN PAGE, OR ATTEMPTED LOGIN
router.post("/login", async (req, res) => {
  //NO FORM INPUT SO NO LOGIN ATTEMPTED
  if (!req.body.username) {
    res.render("account/login", { origin: req.query.origin });
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
        res.render("account/login", {
          err: "user or password incorrect",
          origin: req.query.origin,
        });
        return;
      }
    }

    //USER HAS BEEN FOUND, SO COMPARE THE PASSWORDS
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      res.render("account/login", {
        err: "user or password incorrect",
        origin: req.query.origin,
      });
      return;
    }

    //USER VALIDATED, UPDATE THINGS
    user.lastSeen = Date.now;
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      serverIDs: user.serverIDs,
      lastSeen: user.lastSeen,
      dateAdded: user.dateAdded,
    };
    console.log("/account/login?success=true" + (req.query.origin ? ("&origin=" + req.query.origin): ""));
    return res.redirect("/account/login?success=true" + (req.query.origin ? ("&origin=" + encodeURIComponent(req.query.origin)): ""));

  } catch (err) {
    console.log(err);
    res.render("account/login", { err, origin: req.query.origin });
  }
});

router.get("/servers", async (req, res) => {
  user = "";
  if (typeof req.query.userid !== "undefined") {
    user = await User.findById(req.query.userid);
  } else if (req.session.user) {
    user = req.session.user;
  } else {
    return res.redirect("/");
  }

  user.password = "";
  user.email = "";

  Server.find({ _id: { $in: user.serverIDs } }, (err, servers) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.render("account/servers", {
      servers: servers,
      pageuser: user,
      moment,
    });
  });
});

//USER ACCOUNT EDIT PAGE
router.get("/", async (req, res) => {
  if (req.session.user) {
    console.log(req.session.user);

    error = null;
    if (req.query.error === "1") {
      error = "No details to update.";
    }
    if (req.query.error === "2") {
      error = "Please enter your current password.";
    }
    if (req.query.error === "3") {
      error = "Password is incorrect. Please try again.";
    }
    success = req.query.success;

    return res.render("account/account", { error, success });
  } else {
    res.redirect(
      "account/login?access=false&origin=" + encodeURIComponent("/account")
    );
  }
});

module.exports = router;
