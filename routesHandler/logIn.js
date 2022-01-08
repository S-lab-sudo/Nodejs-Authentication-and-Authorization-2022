// USER LIBRARY
const getIp=require('../helperFunctions/getIpFromReq')
const newUserModel = require('../mongooseModels/newUserModel')
const {passwordChecker}=require('../helperFunctions/passwordHasherAndChecker')
const { tokenMaker } = require('../helperFunctions/tokenMakerAndChecker')
const tokenSaver = require('../helperFunctions/tokenSaver')

const logIn=async(req,res)=>{
    try {
        // GET DATA FROM FRONTEND
        console.log('TODO A GET REQUESTO ON ',req.originalUrl,"\n with params of ",req.body)
        const data=req.body

        // DATA VALIDATION
        if(!data.email || !data.password){
            // NOT ALL DATA RECIEVED FORM USER
            console.log('TODO NOT ALL DATA RECIEVED FROM FRONTEND')
            return res.status(403).json({
                loginError:true,
                success:false,
                error:"Please fill all the information"
            })
        }
        const {email,password}=req.body

        // EMAIL VALIDATION
        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        console.log('TODO INVALID EMAIL ADDRESS')
        return res.status(403).json({
            emailError:true,
            success:false,
            error:'Invalid Email'
        })
    }

    // THIS MAY PREVENT SQL INJECTION
    if(email.includes('$') || email.includes("'") ||email.includes('"')){
        console.log('TODO SPECIAL CHARACTERS IN EMAIL ADDRESS')
        // TODO BLOCK THIS IP
        return res.status(403).json({
            emailError:true,
            success:false,
            error:'Invalid Email'
        })
    }

    // USER IPS
    const userIp= getIp(req.socket.remoteAddress)
    // IP CHECKER
    if(userIp.ipv4.split(".").length!==4){
        console.log('TODO INVALID IP')
        return res.status(403).json({
            ipError:true,
            success:false,
            error:'Invalid Ip'
        })
    }
    
    // USER FRONTEND IP AND BACKEND IP DIDNOT MATCH
    if(userIp.ipv4!==ip){
        console.log('TODO IP DIDNOT MATCH')
        return res.status(403).json({
            ipError:true,
            success:false,
            error:'Please reload the page and retry'
        })
    }
    
    const foundUser= await newUserModel.find({email}).then(response=>response).catch(err=>{
        console.log("DATABASE ERROR OCCURED",err)
        return false
    })
    if(!foundUser){
        return res.status(500)
    }
    if(foundUser.length!==1){
        console.log("NO USER FOUND")
        res.status(200).json({
            success:false,
            error:'Email or password is incorrect'
        })
    }
    if(foundUser.length===1){
        // CHECK PASSWORD IN DATABASE
        const isPasswordCorrect=passwordChecker(password,foundUser[0].password)

        // CONDITIONS
        if(!isPasswordCorrect){
            // INCORRECT PASSWORD
            console.log("PASSWORD INCORRECT")
            res.status(200).json({
                success:false,
                error:'Email or password is incorrect'
            })
        }else{
            const userToken=tokenMaker({username:foundUser[0].userName,email,id:foundUser[0]._id})
            const ipToken=tokenMaker({previousToken:userToken,ip:userIp.ipv4})
            
            // SAVE TOKEN TO DATABASE
            const isTokenSaved=await tokenSaver(foundUser[0]._id,"accessToken1",ipToken,userIp.ipv4)
            if(isTokenSaved){
                // SAVED TOKEN TO DATABASE
                console.log("TODO SAVED TOKEN TO DATABASE AND REPONSE TOKEN",ipToken)
                return res.status(200).json({
                    accessToken: ipToken,
                    success:true
                })
            }else{
                // DATABASE ERROR
                console.log("AN ERROR OCCURED WHILE SAVING TOKEN TO DATABASE",ipToken)
                return res.json(500)
            }
        }
    }
} catch (error) {
    console.log("AN SERVER ERROR OCCURED ",error)
    return res.status(500)
}
}
module.exports=logIn