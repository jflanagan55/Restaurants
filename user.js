const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// userSchema.pre('save',async function(next){
//     this.password = await  bcrypt.hash(this.password, 12)
//     next(); 
// })
module.exports = mongoose.model('User', userSchema);
