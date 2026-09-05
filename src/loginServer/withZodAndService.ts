import express from "express";
import { type Request, type Response } from "express";
import { z } from "zod"
import { isAuthorized, incrementLogins} from "./loginService.ts"

const zLogin = z.object({
  username: z.string().min(4),
  password: z.string().min(8)
})

const app = express();
app.use(express.json());
app.post('/api/user/login', (request:Request, response:Response) => {
  const validatedRequest = zLogin.safeParse(request)
  if (validatedRequest.error)
  {
    response.send({error: "Bad Request"})
  } else {    
    const username:string = validatedRequest.data.username
    const password:string = validatedRequest.data.password
    if (isAuthorized(username, password)) {
      const numLogins = incrementLogins()
      response.send({success:true, numLogins})
    } else 
      response.send({error: "Invalid username or password"})
}
})

// foo


 