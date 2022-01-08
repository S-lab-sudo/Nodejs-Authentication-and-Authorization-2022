// LIBRARY
const bcrypt=require('bcrypt')

const passwordHasher=(passwordtoHash)=>{
    // RETURNS HASHED PASSWORD
    return bcrypt.hashSync(passwordtoHash,15)
}
const passwordChecker=(password,databasePassword)=>{
    // RETURN FALSE IF COMPARISION IS FALSE
    return bcrypt.compareSync(password,databasePassword)
}
// BOTH THE FUNCTIONS ARE SYNCRONOUS FUNCTION
module.exports={passwordHasher,passwordChecker}