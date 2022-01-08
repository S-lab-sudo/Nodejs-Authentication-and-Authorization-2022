// USER MODULES
const {passwordHasher}=require('../helperFunctions/passwordHasherAndChecker')
const tokenSaver=require('../helperFunctions/tokenSaver')
const {tokenMaker}=require('../helperFunctions/tokenMakerAndChecker')
const getIp=require('../helperFunctions/getIpFromReq')
const sendMail=require('../helperFunctions/mailSender')

// DATABASE NEWUSER MODEL
const newUserModel=require('../mongooseModels/newUserModel')

// MAIN FUNCTION
const signUp=(req,res)=>{
    try {
        // REQUEST LOGGER
        console.log('POST REQUEST ON URI,',req.originalUrl,'\nWITH BODY, ',req.body)
        
        // REQUEST BODY
        const data=req.body

        // NOT FULL DATA RECIVED
        if(!data.username || !data.email || !data.password || !data.confirmPassword || !data.ip ){
            console.log('TODO USER HAS NOT SUBMITTED FULL DATA')
            return res.status(403).json({
                success:false,
                allDataError:true,
                error:'Please fill all the information'
            })
        }
        
        // SUPPLIED DATA
        const {username,email,password,confirmPassword,ip}=data
        
        // USER IPS
        const userIp= getIp(req.socket.remoteAddress)
        
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
        
        // IP CHECKER
        if(userIp.ipv4.split(".").length!==4 || ip.split(".").length!==4){
            console.log('TODO INVALID IP')
            return res.status(403).json({
                ipError:true,
                success:false,
                error:'Invalid Ip'
            })
        }
        
        // TODO PASSWORD POLICY
        
        // PASSWORDS DIDNOT MATCH
        if(password!==confirmPassword){
            console.log('TODO PASSWORD DIDNOT MATCH')
            return res.status(403).json({
                success:false,
                passwordError:true,
                error:'Please fill details properly'
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
        
        // CHECK USER IN DATABASE
        newUserModel.find({email}).then(response=>{
            // SAME USER FOUND
            if(response.length===1){
                console.log('TODO USER MATCH')
                return res.status(403).json({
                    emailError:true,
                    success:false,
                    error:'Invalid Email'
                })
            }

            // NO USERS FOUND
            if(response.length===0){
                // HASH USER PASSWORD
                console.log('TODO USER NOT FOUND')
                const hashedPassword=passwordHasher(password)
                
                // DATA TO SAVE IN DATABASE
                const newUserData={userName:username,email,password:hashedPassword,createdIp:userIp}
                const saveNewUserToDatabase=new newUserModel(newUserData)
                
                // SAVING USER TO DATABASE
                saveNewUserToDatabase.save().then(async(response)=>{
                    console.log('TODO USER SAVED TO DATABASE')
                    const id=response._id
                    // CREATING TOKEN AS    ID || IP
                    const token=tokenMaker({id,ip:userIp.ipv4,userDate:response.accountCreatedDate})
                    
                    // SAVING TOKEN  AS     ID || IPV4 || TOKEN
                    const isTokenSaved=await tokenSaver(id,'newUserVerification',token,userIp.ipv4)
                    if(isTokenSaved){
                        console.log('TODO TOKEN SAVED')
                        const url=`https://localhost:5000/api/new-user-verification?token=${token}`

                        // SEND MAIL TO GMAIL
                        const isSent=await sendMail(url,email)
                        if(isSent){
                            console.log('TODO MAIL SENT TO USER')
                            return res.status(200).json({
                                allConfitionsClear:true,
                                success:true,
                                message:"Please check mail that we've just sent to you"
                            })
                        }else{
                            // MAIL NOT SEND
                            console.log('TODO MAIL NOT SENT TO USER')
                            return res.status(500)
                        }
                    }else{
                        // MAIL TOKEN NOT SAVED ON DATABASE
                        console.log('TODO TOKEN SAVED TO DATABASE')
                        return res.status(500)
                    }
                })
            }
        }).catch(error=>{
            console.log('TODO ERROR OCCURED WHILE SAVING DATA')
            console.log('ERROR WHILE SAVING USER TO DATABASE',error)
            return res.status(500)
        })
    } catch (error) {
        console.log('TODO SERVER ERROR ',error)
        console.log('Internal server error',error)
        return res.status(500)
    }
}
module.exports=signUp