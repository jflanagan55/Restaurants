const { ratingClasses } = require('@mui/material')
const mongoose = require('mongoose')
const {v4:uuid} = require('uuid')

const restaurantSchema = new mongoose.Schema({
    resName:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    cuisine:{
        type: String,
        required: true
    },
    rating:{
        type: Number,
        required: true
    },
    pricePoint:{
        type: Number,
        required: true
    },
    notes:{
        type: String,
        
    },
   

})

const Restaurants = mongoose.model('Restaurants', restaurantSchema)

module.exports=Restaurants;