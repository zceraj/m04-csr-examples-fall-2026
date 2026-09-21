import { type Course, type StudentID, type Transcript } from "../types.ts";

/**
 * The public interface of {@link PersistentTranscriptService}. Because the
 * backing store may live outside the current process, every operation is
 * asynchronous and returns a Promise. A rejected Promise signals that the
 * operation could not be completed (e.g. a storage failure) or, for
 * `getTranscript`/`addGrade`, that no transcript exists for the given ID.
 */
interface ITranscriptService {
  /** Removes all students and transcripts from the service. */
  clear(): Promise<void>;

  /**
   * Adds a new student to the database
   * @param newName - the name of the student
   * @returns the newly-assigned ID for the new student
   */
  addStudent(newName: string): Promise<StudentID>;

  /**
   * @param studentName
   * @returns list of studentIDs associated with that name
   */
  nameToIDs(studentName: string): Promise<StudentID[]>;

  /**
   * Returns the transcript for a student
   *
   * @param id - a student ID
   * @returns the transcript for this student with this ID
   * @throws if there is no transcript with the given student ID
   */
  getTranscript(id: StudentID): Promise<Transcript>;

  /**
   * Adds a grade for a student
   *
   * @param id - a student ID
   * @param courseName - Name of the course
   * @param courseGrade - Student's grade in the course
   * @throws if there is no transcript with the given student ID
   */
  addGrade(id: StudentID, courseName: Course, courseGrade: number): Promise<void>;

  /**
   * Returns a GPA for a given ID. Weighing each course equally and only 
   * counting the highest grade if student takes a course more than once. 
   * 
   * ** ADD WHY WE PUT IT HERE 
   * 
   * @param id 
   * @returns GPA for the given student ID
   */
  getGPA(id: StudentID): Promise<number>;
}

export type { ITranscriptService };
