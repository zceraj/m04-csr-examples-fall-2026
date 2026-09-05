import { beforeEach, describe, expect, it } from "vitest";

import { TranscriptService } from "./withSimpleRepo/simpleRepo.service.ts";
// import { TranscriptService } from "./serviceNoRepo.ts";
const service = new TranscriptService();
beforeEach(() => {
  service.clear();
});

describe(`nameToIDs()`, () => {
  it("initially returns an empty list for any name", () => {
    expect(service.nameToIDs("Alvin")).toStrictEqual([]);
  });
  it("returns a list of IDs for a name that has been added", () => {
    const id1 = service.addStudent("Alvin");
    expect(service.nameToIDs("Alvin")).toStrictEqual([id1]);
    const id2 = service.addStudent("Alvin");
    expect(service.nameToIDs("Alvin")).toStrictEqual([id1, id2]);
  });
  it("returns an empty list for a name that has not been added", () => {
    service.addStudent("Alvin"); // we don't care about the ID here, just that it exists

    service.addStudent("Bryn");
    expect(service.nameToIDs("Carol")).toStrictEqual([]);
  });
});

describe(`addStudent()`, () => {
  it(`should give students different IDs`, () => {
    const id1 = service.addStudent("Alvin");
    const id2 = service.addStudent("Bryn");
    const id3 = service.addStudent("Carol");
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it(`should allow students with the same name`, () => {
    const id1 = service.addStudent("Alvin");
    const id2 = service.addStudent("Alvin");
    expect(id1).not.toBe(id2);
  });
});

describe(`getTranscript()`, () => {
  it(`should return an empty transcript for a new student`, () => {
    const id = service.addStudent("Carol");
    expect(service.getTranscript(id)).toStrictEqual({
      student: { studentName: "Carol", studentID: id },
      grades: [],
    });
  });

  it(`should throw an error for a non-existent student`, () => {
    const id = service.addStudent("Carol");
    expect(() => service.getTranscript(id + 1)).toThrow();
  });
});

describe(`addGrade()`, () => {
  it(`should successfully add a new element to an empty transcript`, () => {
    const id = service.addStudent("Carol");
    service.addGrade(id, "Math", 91);
    expect(service.getTranscript(id)).toStrictEqual({
      student: { studentName: "Carol", studentID: id },
      grades: [{ course: "Math", grade: 91 }],
    });
  });

  it(`should throw if given an invalid id`, () => {
    // All IDs are invalid in the initial database... including 1.5
    expect(() => service.addGrade(1.5, "Math", 91)).toThrow();
  });

  it(`should attach different grades to different students`, () => {
    const id1 = service.addStudent("Carol");
    const id2 = service.addStudent("Darol");
    service.addGrade(id1, "Math", 91);
    service.addGrade(id2, "Math", 87);
    expect(service.getTranscript(id1).grades).toStrictEqual([{ course: "Math", grade: 91 }]);
    expect(service.getTranscript(id2).grades).toStrictEqual([{ course: "Math", grade: 87 }]);
  });

  it(`should permit multiple grades for a single class`, () => {
    const id = service.addStudent("Eris");
    service.addGrade(id, "Math", 91);
    service.addGrade(id, "Math", 87);
    expect(service.getTranscript(id).grades.sort((a, b) => a.grade - b.grade)).toStrictEqual([
      { course: "Math", grade: 87 },
      { course: "Math", grade: 91 },
    ]);
  });
});
