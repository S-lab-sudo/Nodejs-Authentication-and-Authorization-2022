// TOKEN MODEL
const tokenModel=require('../mongooseModels/tokenModel')

const tokenSaver=async(userId,tokenName,token,ip)=>{
        const tokenDataToSave={userId,tokenName,token,ip}
        const saveToken=new tokenModel(tokenDataToSave)
        return await saveToken.save().then(()=>true).catch(()=>false)
}

module.exports=tokenSaver