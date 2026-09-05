import express from "express";
import { type Request, type Response } from "express";

let numLogins = 0;
const app = express();
app.use(express.json());
app.post('/api/user/login', (request:Request, response:Response) => {
  const { username, password } = request.body;
  if (username.toLowerCase() === 'user1' && password === 'sekret') {
    response.send({ success: true, numLogins: ++numLogins });
  } else {
    response.send({ error: 'Invalid username or password' });
  }
});