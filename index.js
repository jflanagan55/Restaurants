const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Restaurant = require("./restaurants");
const User = require("./user");
const bcrypt = require("bcrypt");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = require("connect-mongo");

const cuisine = ["", "Italian", "Mexican", "Greek", "Chinese", "Japanese", "Indian", "Thai", "American", "Spanish", "French", "Other"]
const states = ["", "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MP", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UM", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"]


const dbString = "mongodb://localhost:27017/restaurants";
mongoose
  .connect(dbString, { useNewUrlParser: true })
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
    secret: "changelater",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbString }),
    cookie: {secure: true}
  })
);
// app.use(function(req,res,next){
//     res.locals.id = req.session.user_id;
// })
const requireAuth = (req, res, next) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  next();
};

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
   const hashedPw = await bcrypt.hash(password, 12,)
 
const user = new User({ 
    username, 
    password: hashedPw,
    email});
await user.save();
res.redirect("/login");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const validUser = await User.findOne({username})
    const validate = await bcrypt.compare(password, validUser.password)
  if (validate) {
    req.session.user_id = validUser._id;
    res.redirect(`/${req.session.user_id}/restaurants`);
  } else {
    console.log("no sir");
  }
});
app.get("/:id/restaurants", requireAuth, async (req, res) => {
    const id = req.session.user_id;
    const user = await User.findById(id);
    let restaurant = [];
    const ressies = user.restaurants;
    for(let rest of ressies){
        const found = await Restaurant.findById(rest);
        restaurant.push(found);
        
    }
    res.render('restaurants', {data:{restaurant, id}})
});
app.get('/:id/restaurants/new', requireAuth,(req, res)=>{
    const id = req.session.user_id;
    res.render('new', {id, cuisine, states})
})

// app.get('/:id', async(req,res)=>{
//     const { id } = req.params;
//     const restaurant = await Restaurant.findById(id)
//     res.render('show', { restaurant })
// })

app.post('/:id/restaurants', async (req, res)=>{
    const id = req.session.user_id;
    const user = await User.findById(id);
    const{resName, city, state, cuisine, rating, pricePoint, notes} = req.body;
    const newRestaurant = new Restaurant({
        resName,
        city,
        state,
        cuisine,
        rating,
        pricePoint,
        notes,
        creator: id

    });
    await newRestaurant.save()
    user.restaurants.push(newRestaurant);
    await user.save();
    res.redirect(`/${id}/restaurants`)

})

app.get("/:id/restaurants/:id/edit", async(req, res)=>{
    const user_id = req.session.user_id;
    const {id} = req.params
    const restaurant = await Restaurant.findById(id);
    res.render('edit', {restaurant, cuisine, states, user_id})
})
app.put("/:id/restaurants/:id/edit", async(req, res)=>{
    const user_id = req.session.user_id;
    const {id} = req.params;
    const{resName, city, state, cuisine, rating, pricePoint, notes} = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(id, {resName, city, state, cuisine, rating, pricePoint, notes})
    res.redirect(`/${user_id}/restaurants`);
    })

app.delete("/delete", async(req,res)=>{
    const id = req.session.user_id;
    const {resId} = req.body;
    await Restaurant.findByIdAndDelete(resId);
    const user = await User.findById(id);
    user.restaurants.pull(resId);
    
    await user.save();
    res.redirect(`${id}/restaurants`)
})

app.listen(8080, () => {
  console.log("yeyey");
});

// const openModal = document.querySelector("#triggerModal");
// const modal = document.querySelector(".modal");

// openModal.addEventListener("click", () => {
//   modal.classList.add("is-active");
//   history.pushState(null, null, 'new');
// });
// function closeModal() {
//   modal.classList.remove("is-active");
// }

// document.querySelector(".modal-background").addEventListener("click", closeModal);
// document.querySelector(".delete").addEventListener("click", closeModal);
