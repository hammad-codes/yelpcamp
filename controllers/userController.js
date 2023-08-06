const User = require("../models/user");
module.exports.renderRegisterForm = (req, res) => {
  res.render("../views/user/register.ejs");
};

module.exports.renderLoginForm = (req, res) => {
  if (req.query.returnTo) {
    res.render("../views/user/login.ejs", { returnTo: req.query.returnTo });
  } else {
    res.render("../views/user/login.ejs", { returnTo: null });
  }
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    // Add the callback function here
    if (err) {
      console.log("Error during logout:", err);
      return res.redirect("/campgrounds"); // Handle the error gracefully, e.g., redirect to the home page
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};

module.exports.registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ username: username, email: email });
    const newUser = await User.register(user, password);
    //Making a user automatically login after registering the user.
    req.login(newUser, (err) => {
      //requires a callbacks
      if (err) {
        next(err);
      }
      req.flash("success", "Welcome to yelp Camp !");
      res.redirect("/campgrounds");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/register");
  }
};

module.exports.loginUser = (req, res, next) => {
  req.flash("success", "Welcome back!");
  const redirectURL = req.query.returnTo || "/campgrounds";
  req.query.returnTo = null;
  console.log(redirectURL);
  res.redirect(redirectURL);
};
