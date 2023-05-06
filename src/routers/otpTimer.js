const express = require("express");
const router = new express.Router();
const { otpResetSessions } = require("../app");

router.get("/otpTimer", function (req, res) {
  // Render the OTP Timer page using EJS template engine
  res.render("otpTimer", { otpError: false, otpExpired: false, otp: null });
});

router.post("/otpTimer", function (req, res) {
  const enteredOTP = req.body.otp;
  const userPasswordResetSession = otpResetSessions.filter((userSession) => {
    return userSession.email === req.body.email;
  });
  const otp = userPasswordResetSession.otp;

  if (enteredOTP === otp) {
    // Redirect to the new password page
    res.redirect("/newPassword");
  } else {
    // Render the OTP Timer page with error message
    res.render("otpTimer", { otpError: true, otpExpired: false, otp: otp });
  }
});

module.exports = router;
