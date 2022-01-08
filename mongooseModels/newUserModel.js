const mongoose=require('mongoose')
const newUserModelSchema=mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    createdIp:{
        type:Object,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    accountBanned:{
        type:Boolean,
        default:false
    },
    accountCreatedDate:{
        type:Date,
        default:new Date()
    }
})
const newUserModel=mongoose.model('new-user',newUserModelSchema)
module.exports=newUserModel