import express from "express";
import { type Request, type Response } from "express";
import { z } from "zod"

const zLogin = z.object({
  username: z.string().min(4),
  password: z.string().min(8)
})

let numLogins = 0;
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
    if ((username.toLowerCase() === 'user1') && (password === 'secret')) {
      numLogins++;
      response.send({success:true, numLogins})
    } else 
      response.send({error: "Invalid username or password"})
}
})

// foo


 