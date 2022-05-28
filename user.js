const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({

    email:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    restaurants:[{
        type: Schema.Types.ObjectId,
        ref: "Restaurants"
        }]


})
module.exports = mongoose.model('User', userSchema);
