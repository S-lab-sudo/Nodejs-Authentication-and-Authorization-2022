// DOTENV CONFIGURATION
require('dotenv').config({path:'../.env'})

// LIBRARY
const nodemailer=require('nodemailer')
const {google}=require('googleapis')

const CLIENT_ID=process.env.CLIENT_ID
const CLIENT_SECRET=process.env.CLIENT_SECRET
const REFRESH_TOKEN=process.env.REFRESH_TOKEN
const REDIRECT_URI=process.env.REDIRECT_URI
const USER=process.env.USERGMAIL

// REQUIREMENTS FO GETTING ACCESSTOKEN
const oAuth2Client=new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN})

const sendMail=async(url,emailAddress)=>{
    try {
        // GETTING ACCESSTOKEN
        const accessToken=await oAuth2Client.getAccessToken()

        // SETTINGUP NODEMAILER
        const transport=nodemailer.createTransport({
            service:'gmail',
            auth:{
                type:"OAuth2",
                user:USER,
                clientId:CLIENT_ID,
                clientSecret:CLIENT_SECRET,
                refreshToken:REFRESH_TOKEN,
                accessToken:accessToken
            }
        })
        // SETTING UP SENDER, RECIVER AND DATA TO SEND
        const mailOptions={
            from:'BACKEND',
            to:`${emailAddress}`,
            subject:'Verify your account',
            html:`<p><a href="${url}">CLICK HERE</a>&nbsp;to get verify your account.</p>`
        }
        const result=await transport.sendMail(mailOptions)
        if(result.accepted.length===1){
            return true
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

// sendMail('https://localhost:5000/api/test','baaki.g0123@gmail.com')

module.exports=sendMail