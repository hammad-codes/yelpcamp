const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { isLoggedIn } = require("../middleware");
const userController = require("../controllers/userController");

router.route("/register")
.get(userController.renderRegisterForm)
.post(catchAsync(userController.registerUser));

router.route('/login')
.get(userController.renderLoginForm)
.post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.loginUser
  );

router.get("/logout", userController.logout);


module.exports = router;
