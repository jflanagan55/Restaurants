const mongoose = require('mongoose')

const Restaurant = require('./Restaurants')


mongoose.connect('mongodb://localhost:27017/restaurants', {useNewUrlParser: true})
    .then(()=>{
        console.log('we open')
    })
    .catch(err=>{
        console.log("damn")
        console.log(err)
    })

const bills = new Restaurant({
    resName: "Bills",
    city: 'Boston',
    state: "MA",
    cuisine: "italian",
    rating: 5,
    pricePoint: 2


})
bills.save()
.then(bills=>{
    console.log(bills)
})
.catch(()=>"oh no")

const chilis = new Restaurant({
    resName: "chili's",
    city: 'Newport',
    state: "RI",
    cuisine: "american",
    rating: 4,
    pricePoint: 1


})
chilis.save()
.then(chilis=>{
    console.log(chilis)
})
.catch(()=>"dang")

const socialista = new Restaurant({
    resName: "Socialista",
    city: 'Manhattan',
    state: "NY",
    cuisine: "other",
    rating: 5,
    pricePoint: 3


})
socialista.save()
.then(socialista=>{
    console.log(socialista)
})
.catch(()=>"whoops")