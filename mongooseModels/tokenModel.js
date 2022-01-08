const mongoose = require('mongoose');
const tokenModelSchema=mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    tokenName:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    },
    ip:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default:new Date()
    }
})
const tokenModel=mongoose.model('user-token',tokenModelSchema)
module.exports=tokenModel