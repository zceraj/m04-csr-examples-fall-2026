import { beforeEach, describe, expect, it } from "vitest";

import { PersistentTranscriptService } from "./persistentTranscriptService.ts";

// A fresh in-memory service for each test.
let service: PersistentTranscriptService;
beforeEach(() => {
  service = new PersistentTranscriptService();
});

describe(`nameToIDs()`, () => {
  it("initially returns an empty list for any name", async () => {
    expect(await service.nameToIDs("Alvin")).toStrictEqual([]);
  });
  it("returns a list of IDs for a name that has been added", async () => {
    const id1 = await service.addStudent("Alvin");
    expect(await service.nameToIDs("Alvin")).toStrictEqual([id1]);
    const id2 = await service.addStudent("Alvin");
    expect(await service.nameToIDs("Alvin")).toStrictEqual([id1, id2]);
  });
  it("returns an empty list for a name that has not been added", async () => {
    await service.addStudent("Alvin");
    await service.addStudent("Bryn");
    expect(await service.nameToIDs("Carol")).toStrictEqual([]);
  });
});

describe(`addStudent()`, () => {
  it(`should give students different IDs`, async () => {
    const id1 = await service.addStudent("Alvin");
    const id2 = await service.addStudent("Bryn");
    const id3 = await service.addStudent("Carol");
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it(`should allow students with the same name`, async () => {
    const id1 = await service.addStudent("Alvin");
    const id2 = await service.addStudent("Alvin");
    expect(id1).not.toBe(id2);
  });
});

describe(`getTranscript()`, () => {
  it(`should return an empty transcript for a new student`, async () => {
    const id = await service.addStudent("Carol");
    expect(await service.getTranscript(id)).toStrictEqual({
      student: { studentName: "Carol", studentID: id },
      grades: [],
    });
  });

  it(`should throw an error for a non-existent student`, async () => {
    const id = await service.addStudent("Carol");
    await expect(service.getTranscript(id + 1)).rejects.toThrow();
  });
});

describe(`addGrade()`, () => {
  it(`should successfully add a new element to an empty transcript`, async () => {
    const id = await service.addStudent("Carol");
    await service.addGrade(id, "Math", 91);
    expect(await service.getTranscript(id)).toStrictEqual({
      student: { studentName: "Carol", studentID: id },
      grades: [{ course: "Math", grade: 91 }],
    });
  });

  it(`should throw if given an invalid id`, async () => {
    // All IDs are invalid in the initial database... including 1.5
    await expect(service.addGrade(1.5, "Math", 91)).rejects.toThrow();
  });

  it(`should attach different grades to different students`, async () => {
    const id1 = await service.addStudent("Carol");
    const id2 = await service.addStudent("Darol");
    await service.addGrade(id1, "Math", 91);
    await service.addGrade(id2, "Math", 87);
    expect((await service.getTranscript(id1)).grades).toStrictEqual([
      { course: "Math", grade: 91 },
    ]);
    expect((await service.getTranscript(id2)).grades).toStrictEqual([
      { course: "Math", grade: 87 },
    ]);
  });

  it(`should permit multiple grades for a single class`, async () => {
    const id = await service.addStudent("Eris");
    await service.addGrade(id, "Math", 91);
    await service.addGrade(id, "Math", 87);
    const grades = (await service.getTranscript(id)).grades.sort((a, b) => a.grade - b.grade);
    expect(grades).toStrictEqual([
      { course: "Math", grade: 87 },
      { course: "Math", grade: 91 },
    ]);
  });
});

describe(`clear()`, () => {
  it("removes all transcripts", async () => {
    const id = await service.addStudent("Alvin");
    await service.addGrade(id, "Math", 91);
    await service.clear();
    expect(await service.nameToIDs("Alvin")).toStrictEqual([]);
    await expect(service.getTranscript(id)).rejects.toThrow();
  });
});
