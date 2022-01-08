// USER MODULE
const {
    tokenChecker,
    tokenMaker
} = require('../helperFunctions/tokenMakerAndChecker')
const tokenModel = require('../mongooseModels/tokenModel')
const newUserModel = require('../mongooseModels/newUserModel')
const getIp = require('../helperFunctions/getIpFromReq')
const tokenSaver = require('../helperFunctions/tokenSaver')

const newUserConfirmation = async (req, res) => {
    try {
        // CONSOLE REQUEST 
        console.log('GET REQUEST ON URI,', req.url, '\nWITH PARAMETERS, ', req.query)

        // GET PARAMETERS IN URL
        const token = req.query.token

        // NO TOKEN OR TOKEN EXPIRED
        if (!token) {
            console.log('TODO NOT A VALID TOKEN')
            return res.status(403).json({
                tokenError: true,
                success: false,
                error: 'Invalid Token'
            })
        }

        // CHECK TOKEN
        const dataFromToken = tokenChecker(token)

        // INVALID OF EXPIRED TOKEN
        if (!dataFromToken) {
            console.log('TODO PASSING INVALID OR EXPIRED SESSION')
            return res.status(403).json({
                tokenError: true,
                success: false,
                error: 'Invalid Token'
            })
        }

        // USER IP
        const userIp = getIp(req.socket.remoteAddress)

        // SYNCRONOUS
        const tokenFound=await tokenModel.find({userId: dataFromToken.id,token: token,tokenName: 'newUserVerification',ip: userIp.ipv4})
        if(!tokenFound || tokenFound.length !== 1){
            console.log('TODO TOKEN NOT FOUND ON DATABASE')
            return res.status(403).json({
                tokenError: true,
                success: false,
                error: 'Invalid Token'
            })
        }
        if(tokenFound[0].accountCreatedDate!==dataFromToken.userDate){
            console.log('TODO TOKEN CREATED DATE NOT MATCHED');
            return res.status(403).json({
                tokenError: true,
                success: false,
                error: 'Invalid Token'
            })
        }
        if(tokenFound.length===1){
            const tokenData=tokenFound[0];
            const isUpdated=await newUserModel.updateOne({id:tokenData.userId},{$set:{verified:true}}).then(()=>true).catch(err=>{
                console.log("A DATABASE ERROR OCCURED ",err);
                return false;
            })
            if(!isUpdated){
                // DATABASE ERROR
                console.log("AN ERROR OCCURED WHILE UPDATING DATA TO DATABASE");
                return res.json(500);
            }else{
                let userData=await newUserModel.find({_id:tokenData.id}).then(response=>response).catch(err=>{
                    console.log("A DATABASE ERROR OCCURED ",err);
                    return false;
                })
                if(!userData){
                    // DATABASE ERROR
                    console.log("AN ERROR OCCURED WHILE FINDING USER ");
                    return res.json(500);
                }else{
                    // CREATING ACCESSTOKEN FOR FURTHER ACCESS
                    userData=userData[0]
                    const userToken = tokenMaker({
                        username: userData.userName,
                        id: userId,
                        email: userData.email
                    })
                    const ipToken = tokenMaker({
                        previousToken: userToken,
                        ip: userIp.ipv4
                    })
                    const isTokenSaved=await tokenSaver(userId,"accessToken1",ipToken,userIp.ipv4)
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
        }

        // // CHECK TOKEN IN DATABASE
        // tokenModel.find({
        //     userId: dataFromToken.id,
        //     token: token,
        //     tokenName: 'newUserVerification',
        //     ip: userIp.ipv4
        // }).then(async (response) => {
        //     // TOKEN NOT FOUND IN DATABASE
        //     if (response.length !== 1 || response[0].accountCreatedDate!==dataFromToken.userDate) {
        //         console.log('TODO TOKEN NOT FOUND ON DATABASE')
        //         return res.status(403).json({
        //             tokenError: true,
        //             success: false,
        //             error: 'Invalid Token'
        //         })
        //     }

        //     // TOKEN FOUND IN DATABASE
        //     if (response.length === 1) {
        //         // USERID FROM TOKEN
        //         const userId = response[0].userId

        //         // UPDATE VERIFIED USER
        //         const isSaved = newUserModel.updateOne({
        //             id: userId
        //         }, {
        //             $set: {
        //                 verified: true
        //             }
        //         }).then(() => {
        //             // USER VERIFIED
        //             return true
        //         }).catch(() => {
        //             // USER NOT VERIFIED
        //             console.log('TODO USER NOT VERIFIED OR SERVER ERROR ', error)
        //             return false
        //         })
        //         if (isSaved) {

        //             // USER UPDATED VERIFIED
        //             console.log('TODO USER VERIFIED SUCCESSFULLY WITH ID ', userId)
        //             const userData = await newUserModel.find({
        //                 _id: userId
        //             }).then(response => response).catch(err => {
        //                 console.log('TODO AN SERVER ERROR OCCURED', err)
        //                 return false
        //             })
        //             if (!userData) {
        //                 console.log('AN SERVER ERROR OCCURED')
        //                 return res.status(500)
        //             } else {

        //                 // CREATING ACCESSTOKEN FOR FURTHER ACCESS
        //                 const userToken = tokenMaker({
        //                     username: userData[0].userName,
        //                     id: userId,
        //                     email: userData.email
        //                 })
        //                 const ipToken = tokenMaker({
        //                     previousToken: userToken,
        //                     ip: userIp.ipv4
        //                 })

        //                 // SAVE TOKEN TO THE DATABASE
        //                 const isTokenSaved=await tokenSaver(userId,"accessToken1",ipToken,userIp.ipv4)
        //                 if(isTokenSaved){
        //                     // SAVED TOKEN TO DATABASE
        //                     console.log("TODO SAVED TOKEN TO DATABASE AND REPONSE TOKEN",ipToken)
        //                     return res.status(200).json({
        //                         accessToken: ipToken,
        //                         success:true
        //                     })
        //                 }else{
        //                     // DATABASE ERROR
        //                     console.log("AN ERROR OCCURED WHILE SAVING TOKEN TO DATABASE",ipToken)
        //                     return res.json(500)
        //                 }

        //             }
        //         } else {

        //             // USER NOT VERIFIED OR SERVER ERROR
        //             console.log('TODO USER NOT VERIFIED OR SERVER ERROR ', error)
        //             return res.status(500)
        //         }
        //     }
        // })
    } catch (error) {
        // SERVER ERROR
        console.log("TODO SERVER ERROR")
        return res.status(500)
    }
}
module.exports = newUserConfirmation