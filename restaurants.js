const mongoose = require('mongoose')
const {Schema} = mongoose;



const restaurantSchema = new Schema({
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
    creator:[{
        type: Schema.Types.ObjectId,
        ref: "User"
        }]


})

const Restaurants = mongoose.model('Restaurants', restaurantSchema)

module.exports=Restaurants;