import { z } from "zod";

/* Handle API requests to create a new student record */
const zAddStudentBody = z.object({
  password: z.string(),
  studentName: z.string(),
});
