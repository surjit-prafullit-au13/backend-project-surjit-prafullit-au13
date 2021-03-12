const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    is_admin: {type: Boolean, default: false},
    is_active: {type:Boolean, default:false},
    key:{type:String, default:null}
})

const User = new mongoose.model('User', userSchema)
module.exports = User