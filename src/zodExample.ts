import { z } from 'zod';
import express from 'express';
const app = express();
app.use(express.json());
const zAuth = z.object({ username: z.string(), password: z.string() });
app.post('/', (req, res) => {
  const auth = zAuth.safeParse(req.body);
  if (auth.error) {
    res.status(400).send({ error: 'Unexpected message' });  
 } else if (auth.data.password !== 'secret') {
    res.status(403).send({ error: 'Wrong password' });
  } else {
    res.send({ message: `WELCOME,${auth.data.username.toUpperCase()}` });
  }
});

// illustrate validation for addStudent
// describe valid addStudent body
const zAddStudentBody = z.object({
  password: z.string().max(12),
  studentName: z.string().max(16),
});

function validateAddStudent(rawPayload:any) {
    const parseResult = zAddStudentBody.safeParse(rawPayload);
    if (parseResult.error) {
        // error action
    } else {
        const password: string = parseResult.data.password
        const studentName: string = parseResult.data.studentName
        // success action
    }
}

