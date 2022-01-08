const getIp=(data)=>{
    let ips=data.split(':')
    const ipv4=ips[ips.length-1]
    ips.pop()
    const ipv6=ips.join(":")
    return {ipv4,ipv6}
}
module.exports=getIp