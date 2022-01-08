const {execSync}=require('child_process')
const createSSLServer=async()=>{
    await execSync('openssl genrsa -out ./SSLCERT/key.pem')
    await execSync('openssl req -new -key ./SSLCERT/key.pem -out ./SSLCERT/csr.pem -subj "/C=NP/ST=3/L=Nepal/O=SSL Certificate/OU=IT Department/CN=LL"')
    await execSync('openssl x509 -req -days 356 -in ./SSLCERT/csr.pem -signkey ./SSLCERT/key.pem -out ./SSLCERT/cert.pem')
}
module.exports=createSSLServer