// DOTENV CONFIGURATION
require('dotenv').config({path:'../.env'})

// LIBRARY
const jwt=require('jsonwebtoken')

const tokenMaker=(data)=>{
    return jwt.sign(data,process.env.SECRET_KEY,{algorithm:"HS512",expiresIn:60*60*2})
}
const tokenChecker=(token)=>{
    try {
        return jwt.verify(token,process.env.SECRET_KEY)
    } catch (error) {
        return false
    }
}
// BOTH THE FUNCTIONS ARE SYNCRONOUS FUNCTION
module.exports={tokenMaker,tokenChecker}