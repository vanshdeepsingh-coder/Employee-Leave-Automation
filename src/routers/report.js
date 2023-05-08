const express = require("express");
const auth = require("../middlewares/adminAuth");
const Leave = require("../models/leave");
const User = require("../models/user");
const router = new express.Router();
require("dotenv").config({ path: "./dev.env" });

// const moment = require('moment')

router.get("/report", auth, async (req, res) => {
  const leaves = await Leave.find({});
  leaves.reverse();
  res.render("report", { leaves: leaves });
});

module.exports = router;
