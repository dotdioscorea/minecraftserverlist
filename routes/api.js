const express = require("express");
const router = express.Router();
const Server = require("../models/serverSchema");
const User = require("../models/userSchema");
const multer = require("multer");
const sizeOf = require("image-size");
const path = require("path");
const fs = require("fs");
const ssc = require("../helpers/server-status-checker");
const { url } = require("inspector");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./banners/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(gif|jpg|jpeg|png)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1000000 },
});

const saveBanner = async (server, banner) => {
  const filename = `${server._id}${path.extname(banner.originalname)}`;
  fs.rename(
    path.join("./banners/temp", banner.originalname),
    path.join("./banners", filename),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Banner image saved as ${filename}`);
    }
  );
};

// Define the route for submitting a new server
router.post("/submit", upload.single("banner"), async (req, res) => {
  try {
    // Validate the submitted data
    const name = req.body.name;
    const ip = req.body.ip;
    const description = req.body.description;
    const banner = req.file;
    const categories = req.body['server-categories'];

    //CHECK FOR VALID SESSION
    if (
      typeof req.session == "undefined" ||
      !req.session.hasOwnProperty("user")
    ) {
      return res.redirect(
        "/account/login?access=false?origin=" +
          encodeURI("servers/server-submit")
      );
    }

    //CHECK FORM DATA
    if (!name || !ip || !description || !banner) {
      return res.render("servers/server-submit", {
        err: "Missing required fields",
      });
    }

    //CHECK BANNER SIZE
    const dimensions = sizeOf(banner.path);
    if (dimensions.width !== 468 || dimensions.height !== 60) {
      return res.render("servers/server-submit", {
        err: "Banner must be 468x60 pixels in size",
      });
    }

    //SAVE SERVER TO DATABAASE
    const server = new Server({
      name,
      ip,
      description,
      ownerID: req.session.user.id,
      categories,
    });
    filename = server._id + path.extname(banner.originalname);
    server.banner = filename;

    //CHECK SERVER IS ONLINE
    try {
      connectionMade = await ssc.checkServerOnline(server);
      console.log(connectionMade);
      if (!connectionMade) {
        return res.render("servers/server-submit", {
          err: "error connecting to server",
        });
      }
    } catch (err) {
      console.log(err);
    }

    //SAVE SERVER TO DATABASE
    server.save((err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
    });

    //UPDATE SERVER METRICS
    await ssc.updateServerStatus(server);

    //SAVE BANNER TO TEMP FOLDER THEN SAVE
    saveBanner(server, banner);

    //ADD SERVER TO USER'S PROFILE
    try {
      const user = await User.findByIdAndUpdate(req.session.user.id, {
        $push: { serverIDs: server.id },
      });
    } catch (err) {
      console.log(err);
    }

    //LET USER KNOW ALL IS WELL
    console.log("Server added successfully with id" + server._id);
    res.render(`servers/submission-success`, { server });
  } catch (err) {
    res.send(err);
  }
});

router.get("/list", (req, res) => {
  Server.find({}, (err, servers) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.json(servers);
  });
});

router.get("/:id/status", (req, res) => {
  const serverId = req.params.id;
  Server.findById(serverId, (err, server) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!server) {
      return res.status(404).send("Server not found");
    }
    // Check if the server is online
    // ...
    return res.json({ status: "Online" });
  });
});

router.post("/:id/upvote", (req, res) => {
  const serverId = req.params.id;
  Server.findById(serverId, (err, server) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!server) {
      return res.status(404).send("Server not found");
    }
    // Update the upvote count for the server
    server.upvotes += 1;
    server.save((err) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send("Upvote added successfully");
    });
  });
});

// CALLED TO DELETE SERVER
router.get("/delete/:id", (req, res) => {
  const id = req.params.id; // Get the server id from the URL
  Server.findByIdAndDelete(id, (err) => {
    // Find and delete the server
    if (err) {
      console.log(err); // Log any errors
      return res.send("Error deleting server"); // Return an error message
    }
    console.log("Server deleted successfully");
    return res.redirect("/"); // Redirect the user to the homepage
  });
});

module.exports = router;
