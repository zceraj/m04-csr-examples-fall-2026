import { type Request, type Response } from "express";
import { z } from "zod";

import { checkPassword } from "../auth.service.ts";
import { PersistentTranscriptService } from "./transcipt.service.PersistentRepo.ts";
import type { Transcript } from "../types.ts";

const service = new PersistentTranscriptService();

/* The single shape of every response: the status code and the body to send. */
type HandlerResponse = { status: number; body: unknown };

/* A schema that can validate an unknown request body into a `T` (e.g. a zod object). */
type BodySchema<T> = {
  safeParse: (input: unknown) => { success: true; data: T } | { success: false };
};

/**
 * Build a request handler that parses and authenticates the body, then delegates
 * to `handle` for the happy path. The handler contains the only `res.send` in the
 * file, so each request is answered exactly once by construction: `handle` returns
 * a value and never touches `res`, and every path yields a single `HandlerResponse`.
 */
function withValidation<T extends { password: string }>(
  zodSchema: BodySchema<T>,
  responseFn: (data: T) => Promise<HandlerResponse>,
) {
  return async (req: Request, res: Response) => {
    const parsed = zodSchema.safeParse(req.body);
    const handlerResponse: HandlerResponse = !parsed.success
      ? { status: 400, body: { error: "Poorly-formed request" } }
      : !checkPassword(parsed.data.password)
        ? { status: 403, body: { error: "Invalid credentials" } }
        : await responseFn(parsed.data);
    res.status(handlerResponse.status).send(handlerResponse.body); // the one and only response
  };
}

/* Handle API requests to create a new student record */
const zAddStudentBody = z.object({
  password: z.string().max(12),
  studentName: z.string().max(16),
});

export const addStudent = withValidation(zAddStudentBody, async (data) => ({
  status: 200,
  body: { studentID: await service.addStudent(data.studentName) },
}));

/* Handle API requests to add a grade to a student */
const zAddGradeBody = z.object({
  password: z.string().max(12),
  studentID: z.int().gte(0),
  courseName: z.string(),
  courseGrade: z.number().gte(0).lte(100),
});

export const addGrade = withValidation(zAddGradeBody, async (data) => {
  try {
    await service.addGrade(data.studentID, data.courseName, data.courseGrade);
    return { status: 200, body: { success: true } };
  } catch {
    return { status: 200, body: { success: false } };
  }
});

/* Handle API requests to retrieve a student transcript */
const zGetTranscriptBody = z.object({
  password: z.string().max(12),
  studentID: z.int().gte(0),
});

export const getTranscript = withValidation(zGetTranscriptBody, async (data) => {
  try {
    const transcript: Transcript = await service.getTranscript(data.studentID);
    return { status: 200, body: { success: true, transcript } };
  } catch {
    return { status: 200, body: { success: false } };
  }
});
