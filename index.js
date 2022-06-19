const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Restaurant = require("./models/restaurants");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
require("dotenv").config();
const port = process.env.PORT || 3000;
const cuisine = [
  "",
  "Italian",
  "Mexican",
  "Greek",
  "Chinese",
  "Japanese",
  "Indian",
  "Thai",
  "American",
  "Spanish",
  "French",
  "Other",
];
const states = [
  "",
  "AK",
  "AL",
  "AR",
  "AS",
  "AZ",
  "CA",
  "CO",
  "CT",
  "DC",
  "DE",
  "FL",
  "GA",
  "GU",
  "HI",
  "IA",
  "ID",
  "IL",
  "IN",
  "KS",
  "KY",
  "LA",
  "MA",
  "MD",
  "ME",
  "MI",
  "MN",
  "MO",
  "MP",
  "MS",
  "MT",
  "NC",
  "ND",
  "NE",
  "NH",
  "NJ",
  "NM",
  "NV",
  "NY",
  "OH",
  "OK",
  "OR",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UM",
  "UT",
  "VA",
  "VI",
  "VT",
  "WA",
  "WI",
  "WV",
  "WY",
];
const cityRegex = new RegExp(
  /^[A-z](?!.*--)(?!.*'')(?!.*\.\.)[A-z- '.]+[A-z]$/
);

mongoose
  .connect(process.env.DATABASE, { useNewUrlParser: true })
  .then(() => {
    console.log("we open");
  })
  .catch((err) => {
    console.log("damn");
    console.log(err);
  });

app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret:"changelater",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
  })
);
app.use(flash());

const requireAuth = (req, res, next) => {
  if (!req.session.user_id) {
    req.flash("authorize", "You must Sign in");
    return res.redirect("/login");
  }
  next();
};

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register", { messages: req.flash("error") });
});
app.post("/register", async (req, res) => {
  const { username, password, confirmPassword, email } = req.body;
  const usernameExists = await User.findOne({ username });
  const emailExists = await User.findOne({ email });
  const passwordRegex = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  );
  const emailRegex = new RegExp(/^\S+@\S+\.\S+[a-z]$/);

  if (usernameExists) {
    req.flash("error", "Username is already in use");
    return res.redirect("/register");
  }

  if (emailExists) {
    req.flash("error", "Email is already in use");
    return res.redirect("/register");
  }
  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/register");
  }

  if (passwordRegex.test(password) === false) {
    req.flash(
      "error",
      "Password must be 8 characters long and contain a number, uppercase letter, and lowercase letter"
    );
    return res.redirect("/register");
  }
  if (emailRegex.test(email) === false) {
    req.flash("error", "Please enter a valid email");
    return res.redirect("/register");
  }

  const hashedPw = await bcrypt.hash(password, 12);

  const user = new User({
    username,
    password: hashedPw,
    email,
  });
  await user.save();
  req.flash("success", "Successfully made account, please sign in.");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", {
    messages: req.flash("error"),
    success: req.flash("success"),
    authorize: req.flash("authorize"),
  });
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const validUser = await User.findOne({ username });

  if (!validUser) {
    req.flash("error", "Incorrect Username or Password");
    return res.redirect("login");
  }
  const validate = await bcrypt.compare(password, validUser.password);
  if (!validate) {
    req.flash("error", "Incorrect Username or Password");
    return res.redirect("login");
  }
  req.session.user_id = validUser._id;
  res.redirect(`${req.session.user_id}/restaurants`);
});

app.get("/:id/restaurants", requireAuth, async (req, res) => {
  const id = req.session.user_id;
  const user = await User.findById(id);
  let restaurant = [];
  const ressies = user.restaurants;
  for (let rest of ressies) {
    const found = await Restaurant.findById(rest);
    restaurant.push(found);
  }
  res.render("restaurants", { restaurant, id });
});

app.get("/:id/restaurants/new", requireAuth, (req, res) => {
  const { id } = req.params;
  res.render("new", { id, cuisine, states, messages: req.flash("error") });
});

app.post("/:id/restaurants", requireAuth, async (req, res) => {
  const id = req.session.user_id;
  const user = await User.findById(id);
  const { resName, city, state, cuisine, rating, pricePoint, notes, _id } =
    req.body;
  const cityTest = cityRegex.test(city);
  if (cityTest === false) {
    req.flash("error", "Please enter a valid city");
    return res.redirect("/id/restaurants/new");
  }
  if (pricePoint === undefined) {
    req.flash("error", "Please select a Price Point");
    return res.redirect("/id/restaurants/new");
  }
  if (rating === undefined) {
    req.flash("error", "Please select a Rating");
    return res.redirect("/id/restaurants/new");
  }
  const newRestaurant = new Restaurant({
    resName,
    city,
    state,
    cuisine,
    rating,
    pricePoint,
    notes,
    creator: id,
    _id,
  });
  await newRestaurant.save();
  user.restaurants.push(newRestaurant);
  await user.save();
  res.redirect(`/${id}/restaurants`);
});

app.get("/:id/restaurants/:id/edit", requireAuth, async (req, res) => {
  const user_id = req.session.user_id;
  const { id } = req.params;
  const restaurant = await Restaurant.findById(id);
  res.render("edit", {
    restaurant,
    cuisine,
    states,
    user_id,
    messages: req.flash("error"),
  });
});
app.put("/:id/restaurants/:id/edit", requireAuth, async (req, res) => {
  const user_id = req.session.user_id;
  const { id } = req.params;
  const { resName, city, state, cuisine, rating, pricePoint, notes } = req.body;
  const cityTest = cityRegex.test(city);
  if (cityTest === false) {
    req.flash("error", "Please enter a valid city");
    return res.redirect(`/${user_id}/restaurants/${id}/edit`);
  }
  const restaurant = await Restaurant.findByIdAndUpdate(id, {
    resName,
    city,
    state,
    cuisine,
    rating,
    pricePoint,
    notes,
  });
  res.redirect(`/${user_id}/restaurants`);
});
app.get("/:id/restaurants/:id/details", requireAuth, async (req, res) => {
  const user_id = req.session.user_id;
  const { id } = req.params;
  const restaurant = await Restaurant.findById(id);
  res.render("details", { restaurant, cuisine, states, user_id });
});
app.delete("/delete/:id", requireAuth, async (req, res) => {
  const user_id = req.session.user_id;
  const { id } = req.params;
  await Restaurant.findByIdAndDelete(id);
  const user = await User.findById(user_id);
  user.restaurants.pull(id);
  await user.save();
  res.redirect(`/${user_id}/restaurants`);
});
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});
app.all("*", (req, res) => {
  res.render("unknown");
});

app.listen(port, () => {
  console.log("yeyey");
});

