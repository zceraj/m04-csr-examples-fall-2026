import { beforeEach, describe, expect, it } from "vitest";

import { SimpleDB } from "./simpleRepo.ts";

// A fresh in-memory SimpleDB for each test. T is a simple string here.
let db: SimpleDB<string>;
beforeEach(() => {
  db = new SimpleDB<string>();
});

describe(`getRecord()`, () => {
  it("returns undefined for an ID that does not exist", () => {
    expect(db.getRecord(999)).toBeUndefined();
  });

  it("returns the full record (id, name, data) for an existing ID", () => {
    const id = db.newRecord("Alvin");
    db.setData(id, "payload");
    expect(db.getRecord(id)).toStrictEqual({ id, name: "Alvin", data: "payload" });
  });

  it("returns the record with data undefined when data was never set", () => {
    const id = db.newRecord("Alvin");
    expect(db.getRecord(id)).toStrictEqual({ id, name: "Alvin", data: undefined });
  });

  it("returns undefined again after the record is deleted", () => {
    const id = db.newRecord("Alvin");
    db.deleteRecord(id);
    expect(db.getRecord(id)).toBeUndefined();
  });
});

describe(`newRecord()`, () => {
  it("gives different records different IDs", () => {
    const id1 = db.newRecord("Alvin");
    const id2 = db.newRecord("Bryn");
    expect(id1).not.toBe(id2);
  });

  it("allows multiple records with the same name", () => {
    const id1 = db.newRecord("Alvin");
    const id2 = db.newRecord("Alvin");
    expect(id1).not.toBe(id2);
    expect(db.nameToIDs("Alvin")).toStrictEqual([id1, id2]);
  });
});

describe(`setData()`, () => {
  it("throws when setting data on a non-existent ID", () => {
    expect(() => db.setData(999, "nope")).toThrow();
  });

  it("overwrites data on a second setData", () => {
    const id = db.newRecord("Alvin");
    db.setData(id, "first");
    db.setData(id, "second");
    expect(db.getRecord(id)?.data).toBe("second");
  });
});

describe(`deleteRecord()`, () => {
  it("returns false when no record has the given ID", () => {
    expect(db.deleteRecord(999)).toBe(false);
  });

  it("returns true and removes the record when it exists", () => {
    const id = db.newRecord("Alvin");
    expect(db.deleteRecord(id)).toBe(true);
    expect(db.getRecord(id)).toBeUndefined();
  });

  it("removes the deleted ID from its name index", () => {
    const id1 = db.newRecord("Alvin");
    const id2 = db.newRecord("Alvin");
    db.deleteRecord(id1);
    expect(db.nameToIDs("Alvin")).toStrictEqual([id2]);
  });
});

describe(`nameToIDs()`, () => {
  it("returns an empty list for a name that has not been added", () => {
    expect(db.nameToIDs("Carol")).toStrictEqual([]);
  });
});

describe(`clear()`, () => {
  it("removes all records", () => {
    const id = db.newRecord("Alvin");
    db.setData(id, "data");
    db.clear();
    expect(db.getRecord(id)).toBeUndefined();
    expect(db.nameToIDs("Alvin")).toStrictEqual([]);
  });
});
