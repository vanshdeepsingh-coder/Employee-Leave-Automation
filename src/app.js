require("./db/mongoose");

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const cron = require("node-cron");
const User = require("./models/user");
const Leave = require("./models/leave");
const homeRouter = require("./routers/home");
const registerRouter = require("./routers/register");
const loginRouter = require("./routers/login");
const midadminLoginRouter = require("./routers/midadminLogin");
const midadminRouter = require("./routers/midadmin");
const adminLoginRouter = require("./routers/adminLogin");
const logoutRouter = require("./routers/logout");
const userRouter = require("./routers/user");
const leaveFormRouter = require("./routers/leaveForm");
const adminRouter = require("./routers/admin");
const forgotPasswordRouter = require("./routers/forgotPassword");
// const otpTimerRouter = require("./routers/otpTimer");
const { PasswordResetSessionModel } = require("./models/passwordreset");
const report = require("./routers/report");

//forgot password middlewares
const unauth = require("./middlewares/unauth");
const sendEmail = require("./middlewares/sendEmail");

const app = express();
app.set("view engine", "ejs");

//views folder
app.set("views", path.join(__dirname, "../templates/views"));

//public folder
app.use(express.static(path.join(__dirname, "../public")));

//cookie parser
app.use(cookieParser());

//body parser
app.use(express.urlencoded({ extended: false }));

app.use(homeRouter);
app.use(registerRouter);
app.use(loginRouter);
app.use(adminLoginRouter);
app.use(logoutRouter);
app.use(userRouter);
app.use(leaveFormRouter);
app.use(midadminLoginRouter);
app.use(midadminRouter);
app.use(adminRouter);
// app.use(forgotPasswordRouter);
// app.use(otpTimerRouter);
app.use(report);

app.get("/delete/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  const deletedUser = await User.deleteOne({ _id: id });
  const users = await User.find({});

  res.redirect("/admin");
});

app.post("/forgotPassword", async (req, res) => {
  console.log("check 1");
  // console.log(req.body.email)
  try {
    const user = await User.findOne({ email: req.body.email });
    const otp = Math.random().toString().slice(2, 8);
    const sended = await sendEmail("Password Reset OTP", otp, user.email);

    let passwordResponse = await PasswordResetSessionModel.create({
      email: user.email,
      otp: otp,
      startTime: Date.now(),
    });

    // console.log(otpResetSessions)

    const token = await user.generateAuthToken();
    res.cookie("auth_token", token);
    res.redirect(`/otpTimer?email=${req.body.email}`);
  } catch (e) {
    res.render("/login?error=1");
    console.log(e);
  }
});

app.get("/forgotPassword", unauth, (req, res) => {
  res.render("forgotPassword", { type: "user", error: req.query.error });
});

app.get("/newPassword", (req, res) => {
  res.render("newpassword");
});

app.post("/newPassword", async (req, res) => {
  console.log(req.body.password);
  console.log(req.query.email);
  try {
    let updateResponse = await User.findOneAndUpdate(
      { email: req.query.email },
      { password: req.body.password }
    );
    if (updateResponse.error === null) {
      console.log("updated password successfully");
    }
    const user = await User.findOne({ email: req.query.email });
    console.log(user);
    res.redirect("/");
  } catch (e) {
    res.redirect("/login?error=1");
    console.log(e);
  }
});

app.get("/otpTimer", async function (req, res) {
  // Render the OTP Timer page using EJS template engine
  // console.log(req.query.email)
  let otpResetSessions = await PasswordResetSessionModel.find({});

  if (otpResetSessions.length === 0) {
    console.log("no sessions");
    res.redirect("/forgotPassword?error=1");
    return;
  }

  console.log(otpResetSessions);
  res.render("otpTimer", { otpError: false, otpExpired: false, otp: null });
});

app.post("/otpTimer", async function (req, res) {
  let otpResetSessions = await PasswordResetSessionModel.find({});
  console.log(otpResetSessions);

  if (otpResetSessions.length === 0) console.log("no sessions");

  const enteredOTP = req.body.otp;
  console.log(req.body.otp);
  const email = req.query.email;

  const userPasswordResetSession = otpResetSessions.filter((userSession) => {
    return userSession.email === email;
  });
  console.log(userPasswordResetSession);
  const otp = userPasswordResetSession[0].otp;

  if (enteredOTP === otp) {
    // Redirect to the new password page
    res.redirect(`/newPassword?email=${email}`);
  } else {
    // Render the OTP Timer page with error message
    res.render("otpTimer", { otpError: true, otpExpired: false, otp: otp });
  }
});
//Cron job which runs every minute to delete expired OTP sessions
cron.schedule(
  "1 * * * * *",
  async () => {
    let otpResetSessions = await PasswordResetSessionModel.find({});
    if (otpResetSessions.length === 0) return;
    otpResetSessions.forEach((userSession, index) => {
      if (Date.now() - userSession.startTime > 60000) {
        otpResetSessions.splice(index, 1);
      }
    });
  },
  {
    scheduled: true,
  }
);

// Scheduled tasks
cron.schedule(
  "1 0 0 * * *",
  async () => {
    var currentTimestamp = new Date().getTime();
    currentTimestamp += 330 * 60 * 1000;
    const today = new Date(currentTimestamp);

    const users = await User.find({});

    for (var user of users) {
      const leaves = await Leave.find({
        userID: user._id,
        status: "approved",
        startTime: { $lte: today },
        endTime: { $gte: today },
      });
      if (leaves.length > 0) {
        user.isOnLeave = true;
      } else {
        user.isOnLeave = false;
      }

      await user.save();
    }

    const allLeaves = await Leave.find({
      status: { $in: ["recommended", "pending"] },
      startTime: { $lte: today },
    });
    for (var leave of allLeaves) {
      leave.status = "rejected";
      await leave.save();
    }
  },
  {
    scheduled: true,
    // timezone: "Asia/Kolkata"
  }
);

app.listen(process.env.PORT, () => {
  console.log("Server is up!~");
});
