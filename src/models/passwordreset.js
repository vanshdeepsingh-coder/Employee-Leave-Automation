const mongoose = require("mongoose");

const PasswordResetSessionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: Number,
    required: true,
  },
});

const PasswordReset = mongoose.model(
  "PasswordResetSession",
  PasswordResetSessionSchema
);
exports.PasswordResetSessionModel = PasswordReset;
