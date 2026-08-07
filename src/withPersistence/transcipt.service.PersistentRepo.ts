import { KeyvDB } from "./persistentRepo.ts";
import { type Course, type StudentID, type Transcript } from "../types.ts";

/**
 * A transcript service backed by the KeyvDB persistent repository. It offers the
 * same methods as TranscriptService, but stores each student's transcript as the
 * "data" of a persistent record whose name is the student's name and whose ID is
 * the student ID. Because the backing store may be out of process, every method
 * is asynchronous.
 */
export class PersistentTranscriptService {
  /**
   * The database of transcripts, keyed by student ID. The record name is the
   * student's name, so the database's own name index backs nameToIDs.
   */
  private _db: KeyvDB<Transcript>;

  /**
   * @param db - the persistent repository to store transcripts in. Defaults to
   * a fresh in-memory KeyvDB; supply an adapter-backed instance for durable
   * storage.
   */
  constructor(db: KeyvDB<Transcript> = new KeyvDB<Transcript>()) {
    this._db = db;
  }

  async clear(): Promise<void> {
    await this._db.clear();
  }

  /**
   * Adds a new student to the database
   * @param newName - the name of the student
   * @returns the newly-assigned ID for the new student
   */
  async addStudent(newName: string): Promise<StudentID> {
    const newID = await this._db.newRecord(newName);
    const newTranscript: Transcript = {
      student: { studentID: newID, studentName: newName },
      grades: [],
    };
    await this._db.setData(newID, newTranscript);
    return newID;
  }

  /**
   * @param studentName
   * @returns list of studentIDs associated with that name
   */
  async nameToIDs(studentName: string): Promise<StudentID[]> {
    return this._db.nameToIDs(studentName);
  }

  /**
   * Returns the transcript for a student
   *
   * @param id - a student ID
   * @returns the transcript for this student with this ID
   * @throws if there is no transcript with the given student ID
   */
  async getTranscript(id: StudentID): Promise<Transcript> {
    const record = await this._db.getRecord(id);
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
  async addGrade(id: StudentID, courseName: Course, courseGrade: number): Promise<void> {
    const transcript = await this.getTranscript(id); // rejects if the id is unknown
    const updated: Transcript = {
      student: transcript.student,
      grades: [...transcript.grades, { course: courseName, grade: courseGrade }],
    };
    await this._db.setData(id, updated);
  }
}
