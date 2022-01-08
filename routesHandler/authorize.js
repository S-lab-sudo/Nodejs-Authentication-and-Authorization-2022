// USER MODULES
const { tokenChecker } = require("../helperFunctions/tokenMakerAndChecker")
const tokenModel = require("../mongooseModels/tokenModel")

const authorize=async(req,res)=>{
    try {
        // CONSOLE REQUEST
        console.log('GET REQUEST ON URI,', req.url, '\nWITH PARAMETERS, ', req.body)

        // REQUEST OF BODY
        const data=req.body
        
        // USER IPS
        const userIp= getIp(req.socket.remoteAddress)

        // SUPPLIED DATA
        const {ip}=data

        if(ip!==userIp.ipv4 || userIp.ipv4.split(".").length!==4 || ip.split(".").length!==4){
            // INVALID IP
            console.log('TODO INVALID IP')
            return res.status(403).json({
                ipError:true,
                success:false,
                error:'Invalid Ip'
            })
        }

        // TOKEN FROM HEADER
        // NEED TO SEND LIKE AUTHORIZATION=BEARER TOKEN
        const token=req.get("Authorization").split(' ')[1]

        const dataFromToken=tokenChecker(token)

        if(!dataFromToken){
            // INVALID TOKEN
            console.log("INVALID TOKEN FROM USER",token)
            return res.status(403).json({
                success:false,
                error:"Invalid Token"
            })
        }
        else{
            // MORE VALIDATION
            const actualData=tokenChecker(dataFromToken.previousToken)
            
            if(!actualData){
                // INVALID TOKEN
                console.log("INVALID TOKEN FROM USER",token)
                return res.status(403).json({
                    success:false,
                    error:"Invalid Token"
                })
            }else{
                // QUERY IN DATABASE
                const isFoundToken=await tokenModel.find({tokenName:'accessToken',userId:actualData.id,ip:dataFromToken.ip,token}).then(response=>response).catch(err=>{
                    console.log("DATABASE ERROR OCCURED ",err)
                    return false
                })
                
                // NO TOKEN FOUND
                if(!isFoundToken){
                    console.log("NO TOKEN WAS FOUND")
                    return res.status(403).json({
                        success:false,
                        error:"Invalid Token"
                    })
                }else{
                    // AUTHORIZED
                    console.log("THIS USER WAS AUTHORIZED")
                    return res.status(200).json({
                        body:"You are authorized"
                    })
                }
            }

        }

    } catch (error) {
        console.log("AN ERROR OCCURED ON SERVER",error)
        return res.status(500)
    }
}
module.exports=authorize