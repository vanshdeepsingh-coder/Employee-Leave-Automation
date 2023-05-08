const express = require("express");
const User = require("../models/user");
const unauth = require("../middlewares/unauth");
const { sendEmail } = require("../middlewares/sendEmail");

const router = new express.Router();

router.get("/forgotPassword", unauth, (req, res) => {
  res.render("forgotPassword", { type: "user", error: req.query.error });
});

router.post("/forgotPassword", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email);
    const otp = Math.random().toString().slice(2, 8);
    otpResetSessions.push({ email: user.email, otp });
    sendEmail("Password Reset OTP", otp, user.email);
    otpResetSessions.push({ email: user.email, otp, startTime: Date.now() });

    const token = await user.generateAuthToken();
    res.cookie("auth_token", token);
    res.redirect("/");
  } catch (e) {
    res.redirect("/login?error=1");
  }
});

module.exports = router;
