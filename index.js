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
  })
);
// app.use(function(req,res,next){
//     res.locals.id = req.session.user_id;
// })
const requireAuth = (req, res, next) => {
  if (!req.session.user_id) {
    console.log("there is not id")
    return res.redirect("/login");
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

    if(!validate){
      console.log("no sir")
      return
    }
    req.session.user_id = validUser._id;
    const homeURL = (`${req.session.user_id}/restaurants`)
    res.redirect(homeURL);
  });

//   if (validate) {
//     req.session.user_id = validUser._id;
//     console.log(req.session.user_id)
//     return res.redirect(`/${req.session.user_id}/restaurants`);
//   } else {
//     console.log("no sir");
//   }
// });

// app.post('/logout',(req, res)=>{
//   req.session.destroy();
//   res.redirect('login');
// })
app.get("/:id/restaurants", requireAuth, async (req, res) => {
    const id = req.session.user_id;
    const user = await User.findById(id);
    let restaurant = [];
    const ressies = user.restaurants;
    for(let rest of ressies){
        const found = await Restaurant.findById(rest);
        restaurant.push(found);
        
    }
    console.log("wow")
    console.log(restaurant);
    res.render('restaurants', {restaurant, id})
});



app.get('/:id/restaurants/new', requireAuth, (req, res)=>{
    const {id} = req.params
    res.render('new', {id, cuisine, states})
})

// app.get('/:id', async(req,res)=>{
//     const { id } = req.params;
//     const restaurant = await Restaurant.findById(id)
//     res.render('show', { restaurant })
// })

app.post('/:id/restaurants', requireAuth, async (req, res)=>{
    const id = req.session.user_id;
    const user = await User.findById(id);
    const{resName, city, state, cuisine, rating, pricePoint, notes, _id} = req.body;
    const newRestaurant = new Restaurant({
        resName,
        city,
        state,
        cuisine,
        rating,
        pricePoint,
        notes,
        creator: id,
        _id


    });
    await newRestaurant.save()
    user.restaurants.push(newRestaurant);
    await user.save();
    res.redirect(`/${id}/restaurants`)

})

app.get("/:id/restaurants/:id/edit", requireAuth, async(req, res)=>{
    const user_id = req.session.user_id;
    const {id} = req.params
    const restaurant = await Restaurant.findById(id);
    res.render('edit', {restaurant, cuisine, states, user_id})
})
app.put("/:id/restaurants/:id/edit", requireAuth, async(req, res)=>{
    const user_id = req.session.user_id;
    const {id} = req.params;
    const{resName, city, state, cuisine, rating, pricePoint, notes} = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(id, {resName, city, state, cuisine, rating, pricePoint, notes})
    res.redirect(`/${user_id}/restaurants`);
    })

app.delete("/delete/:id", requireAuth, async(req,res)=>{
    const user_id = req.session.user_id
    const {id} = req.params;
    console.log(id)
    console.log(user_id);
    await Restaurant.findByIdAndDelete(id);
    const user = await User.findById(user_id);
    user.restaurants.pull(id);
    await user.save();
    res.redirect(`/${user_id}/restaurants`)     
  })
  app.post('/logout', (req,res)=>{
    req.session.user_id = null;
    res.redirect('/login');
  })

//     await Restaurant.findByIdAndDelete(resId);
//     const user = await User.findById(id);
//     user.restaurants.pull(resId);
    
//     await user.save();
//     res.redirect(`/${id}/restaurants`)
// })
// app.all('*',(req,res)=>{
//   res.render('unknown');
// })

app.listen(8080, () => {
  console.log("yeyey");
});