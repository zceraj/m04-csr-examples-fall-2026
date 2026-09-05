var numLogins = 0

export function isAuthorized(username:string, password:string):boolean {
    return ((username == "user1") && (password == "secret"))
}

export function incrementLogins(): number {
    numLogins++;
    return numLogins
}