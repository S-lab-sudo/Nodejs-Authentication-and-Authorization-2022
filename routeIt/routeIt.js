// ROUTER
const router=require('express').Router()

// ROUTE HANDLERS
const authorize = require('../routesHandler/authorize')
const logIn = require('../routesHandler/Login')
const newUserConfirmation = require('../routesHandler/newUserConfirmation')
const signUp = require('../routesHandler/signUp')

// GET
router.get('/new-user-verification',newUserConfirmation)


// POSTS
router.post('/signup',signUp)
router.post('/login',logIn)
router.post('/authorize',authorize)


module.exports=router