const express = require('express')
const app = express();
const path = require('path');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const Restaurant = require('./restaurants');
const User = require('./user');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/restaurants', {useNewUrlParser: true})
    .then(()=>{
        console.log('we open')
    })
    .catch(err=>{
        console.log("damn")
        console.log(err)
    })



app.use(express.static(__dirname + '/public'),)
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))

app.get('/', async (req,res)=>{
    res.render('index')
    // const restaurants = await Restaurant.find({})
    // res.render('index', {restaurants})
})

// app.get('/new',(req, res)=>{
//     res.render('new')
// })
app.get('/register',(req, res)=>{
    res.render('register')
})
app.post('/register', async(req, res)=>{
    const {username, password, email} = req.body;
    const hashedPw = await bcrypt.hash(password, 12);
    console.log(hashedPw)
    const user = new User({
        username,
        password: hashedPw,
        email
    })
    console.log(user)
    await user.save()
    res.redirect('/login');
})
app.get('/login',(req, res)=>{
    res.render('login')
})
app.post('/login', async (req, res)=>{
    const { username, password} = req.body;
    const user = await User.findOne({username});
    const userPassword = user.password;
    const result = await bcrypt.compare(password, userPassword);
    if(result){
        console.log("match")
    }
    else{
        console.log("no sir")
    }

})

// app.get('/:id', async(req,res)=>{
//     const { id } = req.params;
//     const restaurant = await Restaurant.findById(id)
//     res.render('show', { restaurant })
// })


// app.post('/', async (req, res)=>{
//     const newRestaurant = new Restaurant(req.body)
//     await newRestaurant.save()
//     res.redirect("/")
// })
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



app.listen(8080, ()=>{
    console.log('yeyey')
})









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
