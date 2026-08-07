import { SimpleDB } from "./simpleRepo.ts";
import { type Course, type StudentID, type Transcript } from "../types.ts";

/**
 * A transcript service backed by the SimpleDB repository. It offers the same
 * methods as TranscriptService, but stores each student's transcript as the
 * "data" of a SimpleDB record whose name is the student's name and whose ID is
 * the student ID.
 */
export class TranscriptService {
  /**
   * The database of transcripts, keyed by student ID. The record name is the
   * student's name, so the database's own name index backs nameToIDs.
   */
  private _db: SimpleDB<Transcript> = new SimpleDB<Transcript>();

  clear(): void {
    this._db.clear();
  }

  /**
   * Adds a new student to the database
   * @param newName - the name of the student
   * @returns the newly-assigned ID for the new student
   */
  addStudent(newName: string): StudentID {
    const newID = this._db.newRecord(newName);
    const newTranscript: Transcript = {
      student: { studentID: newID, studentName: newName },
      grades: [],
    };
    this._db.setData(newID, newTranscript);
    return newID;
  }

  /**
   * @param studentName
   * @returns list of studentIDs associated with that name
   */
  nameToIDs(studentName: string): StudentID[] {
    return this._db.nameToIDs(studentName);
  }

  /**
   * Returns the transcript for a student
   *
   * @param id - a student ID
   * @returns the transcript for this student with this ID
   * @throws if there is no transcript with the given student ID
   */
  getTranscript(id: StudentID): Transcript {
    const record = this._db.getRecord(id);
    if (!record || record.data === undefined) {
      throw new Error(`Transcript not found for student with ID ${id}`);
    }
    return record.data;
  }

  /**
   * Adds a grade for a student
   *
   * @param id - a student ID
   * @param courseName - Name of the course
   * @param courseGrade - Student's grade in the course
   * @throws if there is no transcript with the given student ID
   */
  addGrade(id: StudentID, courseName: Course, courseGrade: number): void {
    const transcript = this.getTranscript(id); // throws if the id is unknown
    const updated: Transcript = {
      student: transcript.student,
      grades: [...transcript.grades, { course: courseName, grade: courseGrade }],
    };
    this._db.setData(id, updated);
  }
}
