import express, { type Request, type Response } from 'express'
import { z } from 'zod'

import { checkPassword } from './auth.service.ts'
import { TranscriptService } from './transcript.service.ts'
import type { Transcript } from './types.ts'

const app = express()
app.use(express.json()) // deliver the request bodies as JSON.
const service = new TranscriptService()

/* The single shape of every response: the status code and the body to send. */
type HandlerResult = { status: number; body: unknown }

/* Validates an unknown request body into a `T` (e.g. a zod schema's `safeParse`). */
type SafeParser<T> = (input: unknown) => { success: true; data: T } | { success: false }

/**
 * Build a request handler that parses and authenticates the body, then delegates
 * to `handle` for the happy path. The handler contains the only `res.send` in the
 * file, so each request is answered exactly once by construction: `handle` returns
 * a value and never touches `res`, and every path yields a single `HandlerResult`.
 */
function makeHandler<T extends {password: string}>(
  safeParse: SafeParser<T>,
  handler: (data: T) => HandlerResult,
) {
  return (req: Request, res: Response) => {
    const parsed = safeParse(req.body)
    const result: HandlerResult = !parsed.success
      ? { status: 400, body: { error: 'Poorly-formed request' } }
      : !checkPassword(parsed.data.password)
        ? { status: 403, body: { error: 'Invalid credentials' } }
        : handler(parsed.data)

    res.status(result.status).send(result.body) // the one and only response
  }
}

/* Handle API requests to create a new student record */
const zAddStudentBody = z.object({
  password: z.string(),
  studentName: z.string(),
})

export const addStudent = makeHandler(zAddStudentBody.safeParse, data => ({
  status: 200,
  body: { studentID: service.addStudent(data.studentName) },
}))

/* Handle API requests to add a grade to a student */
const zAddGradeBody = z.object({
  password: z.string(),
  studentID: z.int().gte(0),
  courseName: z.string(),
  courseGrade: z.number().gte(0).lte(100),
})

export const addGrade = makeHandler(zAddGradeBody.safeParse, data => {
  try {
    service.addGrade(data.studentID, data.courseName, data.courseGrade)
    return { status: 200, body: { success: true } }
  } catch {
    return { status: 200, body: { success: false } }
  }
})

/* Handle API requests to retrieve a student transcript */
const zGetTranscriptBody = z.object({
  password: z.string(),
  studentID: z.int().gte(0),
})

export const getTranscript = makeHandler(zGetTranscriptBody.safeParse, data => {
  try {
    const transcript: Transcript = service.getTranscript(data.studentID)
    return { status: 200, body: { success: true, transcript } }
  } catch {
    return { status: 200, body: { success: false } }
  }
})

export { app }
