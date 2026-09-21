// server.ts
import express from "express";

import * as controller from "./controller.ts";

export const app = express();
app.use(express.json());

// define routes for the API endpoints, and delegate to the controller functions
app.post("/api/addStudent", controller.addStudent);
app.post("/api/addGrade", controller.addGrade);
app.post("/api/getTranscript", controller.getTranscript);
app.post("/api/getGPA". controller.getGPA);
