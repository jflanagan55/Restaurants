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
    const id = validUser._id;
    res.redirect(`/${id}/restaurants`);
  } else {
    console.log("no sir");
  }
});
app.get("/:id/restaurants", requireAuth, async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    let restaurant = [];
    const ressies = user.restaurants;
    for(let rest of ressies){
        const found = await Restaurant.findById(rest);
        restaurant.push(found);
    }
    console.log(restaurant)
    res.render('restaurants', {restaurant})
});
app.get('/:id/restaurants/new',(req, res)=>{
    res.render('new')
})

// app.get('/:id', async(req,res)=>{
//     const { id } = req.params;
//     const restaurant = await Restaurant.findById(id)
//     res.render('show', { restaurant })
// })

app.post('/test', async (req, res)=>{
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

    




    // const restaurants = user.restaurants;
    // const newRestaurant = new Restaurant(req.body)
    // await newRestaurant.save()
    // restaurants.push(newRestaurant)
    // await user.save()
    // res.redirect(`/${id}/restaurants`)



    // const {id} = req.params;
    // const user = await User.findById(id);
    // const restaurants = user.restaurants
    // const newRestaurant = new Restaurant(req.body)
    // await newRestaurant.save()
    // res.redirect("/")
})
// app.get('/:id/edit', async (req, res)=>{
//     const {id} = req.params;
//     const restaurant = await Restaurant.findById(id)
//     res.render('edit', {restaurant})
// })

// app.put("/:id", async(req, res)=>{
//     const {id} = req.params;
//     await Restaurant.findByIdAndUpdate(id, req.body, {runValidators:true})
//     res.redirect('/')
// })
// app.delete("/:id", async(req,res)=>{
//     const {id} = req.params;
//     await Restaurant.findByIdAndDelete(id);
//     console.log('cool')
//     res.redirect('/');

// })

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
