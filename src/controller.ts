import express, { type Request, type Response } from "express";
import {zAddStudentBody} from "./zedTypes.ts";

import { checkPassword } from "./auth.service.ts";
import { TranscriptService } from "./transcript.service.ts";
import type { Transcript } from "./types.ts";

const app = express();
app.use(express.json()); // deliver the request bodies as JSON.
const service = new TranscriptService();

function

export function addStudent(req: Request, res: Response) {
  const body = zAddStudentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).send({ error: "Poorly-formed request" });
  } else if (!checkPassword(body.data.password)) {
    res.status(403).send({ error: "Invalid credentials" });
  } else {
    const id = service.addStudent(body.data.studentName);
    res.send({ studentID: id });
  }
}

export function addStudentUnsafe(req: Request, res: Response) {
  const body = req.body;
  if (!body.success) {
    res.status(400).send({ error: "Poorly-formed request" });
  } else if (!checkPassword(body.data.password)) {
    res.status(403).send({ error: "Invalid credentials" });
  } else {
    const id = service.addStudent(body.data.studentName);
    res.send({ studentID: id });
  }
}

/* Handle API requests to add a grade to a student */
const zAddGradeBody = z.object({
  password: z.string(),
  studentID: z.int().gte(0),
  courseName: z.string(),
  courseGrade: z.number().gte(0).lte(100),
});

export function addGrade(req: Request, res: Response) {
  const body = zAddGradeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).send({ error: "Poorly-formed request" });
  } else if (!checkPassword(body.data.password)) {
    res.status(403).send({ error: "Invalid credentials" });
  } else {
    let response: { success: true } | { success: false };
    try {
      service.addGrade(body.data.studentID, body.data.courseName, body.data.courseGrade);
      response = { success: true };
    } catch {
      response = { success: false };
    }
    res.send(response);
  }
}

/* Handle API requests to retrieve a student transcript */
const zGetTranscriptBody = z.object({
  password: z.string(),
  studentID: z.int().gte(0),
});

export function getTranscript(req: Request, res: Response) {
  const body = zGetTranscriptBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).send({ error: "Poorly-formed request" });
  } else if (!checkPassword(body.data.password)) {
    res.status(403).send({ error: "Invalid credentials" });
  } else {
    let response: { success: true; transcript: Transcript } | { success: false };
    try {
      const transcript = service.getTranscript(body.data.studentID);
      response = { success: true, transcript };
    } catch {
      response = { success: false };
    }
    res.send(response);
  }
}
