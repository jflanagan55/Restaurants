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

userSchema.statics.validateUser = async function(username, password){
    const validUser = await this.findOne({username})
    const validate = await bcrypt.compare(password, validUser.password)
    return validate? validUser: false;
}
userSchema.pre('save',async function(next){
    this.password =await  bcrypt.hash(this.password, 12) 
})
module.exports = mongoose.model('User', userSchema);
