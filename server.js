// DOT ENV DONFIGURATION
require('dotenv').config()

// LIBRARY
const express = require('express');
const mongoose = require('mongoose');
const fs=require('fs')
const https=require('https')
const helmet=require('helmet')

// // USER MODULES OR VARIABLES
const app=express()
const DB=process.env.DB
const PORT=process.env.PORT
const router = require('./routeIt/routeIt');

// CHECKIN SSL Certification
const createSSLServer=require('./SSLCERT/createSSLServer');
if(!fs.existsSync('./SSLCERT/key.pem') || !fs.existsSync('./SSLCERT/csr.pem') || !fs.existsSync('./SSLCERT/cert.pem')){
    console.log('Gettin SSL Certificate')
    createSSLServer()
}
// CREATING SSL SERVER
const sslServer=https.createServer({key:fs.readFileSync('./SSLCERT/key.pem'),cert:fs.readFileSync('./SSLCERT/cert.pem')},app)

// // DATABASE CONNECTION
mongoose.connect(DB).then(()=>console.log('Database Connection Successful')).catch(()=>console.log('Connection with Database is not Established'))

// USAGES || MIDDLEWARES
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api',router)

// // SERVER LISTENING
sslServer.listen(PORT,()=>console.log(`Listening on port ${PORT}`))