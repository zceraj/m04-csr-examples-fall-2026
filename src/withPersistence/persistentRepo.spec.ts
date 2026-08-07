import { beforeEach, describe, expect, it } from "vitest";

import { KeyvDB } from "./persistentRepo.ts";

// A fresh in-memory KeyvDB for each test. T is a simple string here.
let db: KeyvDB<string>;
beforeEach(() => {
  db = new KeyvDB<string>();
});

describe(`newRecord()`, () => {
  it("gives different records different IDs", async () => {
    const id1 = await db.newRecord("Alvin");
    const id2 = await db.newRecord("Bryn");
    const id3 = await db.newRecord("Carol");
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it("allows multiple records with the same name", async () => {
    const id1 = await db.newRecord("Alvin");
    const id2 = await db.newRecord("Alvin");
    expect(id1).not.toBe(id2);
  });
});

describe(`nameToIDs()`, () => {
  it("initially returns an empty list for any name", async () => {
    await db.clear();
    const alvinIDs: number[] = await db.nameToIDs("Alvin");
    expect(alvinIDs).toStrictEqual([]);
  });

  it("returns the IDs of records added under a name, in insertion order", async () => {
    const id1 = await db.newRecord("Alvin");
    expect(await db.nameToIDs("Alvin")).toStrictEqual([id1]);
    const id2 = await db.newRecord("Alvin");
    expect(await db.nameToIDs("Alvin")).toStrictEqual([id1, id2]);
  });

  it("returns an empty list for a name that has not been added", async () => {
    await db.newRecord("Alvin");
    await db.newRecord("Bryn");
    expect(await db.nameToIDs("Carol")).toStrictEqual([]);
  });
});

describe(`getRecord() / setData()`, () => {
  it("returns undefined for an ID that does not exist", async () => {
    expect(await db.getRecord(999)).toBeUndefined();
  });

  it("returns the full record (id, name, data) for an existing ID", async () => {
    const id = await db.newRecord("Alvin");
    await db.setData(id, "payload");
    expect(await db.getRecord(id)).toStrictEqual({ id, name: "Alvin", data: "payload" });
  });

  it("returns a record with undefined data when data was never set", async () => {
    const id = await db.newRecord("Alvin");
    const record = await db.getRecord(id);
    // The store JSON-serializes records, so an unset data property is dropped;
    // the contract is only that record.data reads as undefined.
    expect(record?.id).toBe(id);
    expect(record?.name).toBe("Alvin");
    expect(record?.data).toBeUndefined();
  });

  it("overwrites data on a second setData", async () => {
    const id = await db.newRecord("Alvin");
    await db.setData(id, "first");
    await db.setData(id, "second");
    expect((await db.getRecord(id))?.data).toBe("second");
  });

  it("keeps data for different records independent", async () => {
    const id1 = await db.newRecord("Alvin");
    const id2 = await db.newRecord("Bryn");
    await db.setData(id1, "alvin-data");
    await db.setData(id2, "bryn-data");
    expect((await db.getRecord(id1))?.data).toBe("alvin-data");
    expect((await db.getRecord(id2))?.data).toBe("bryn-data");
  });

  it("rejects when setting data on a non-existent ID", async () => {
    await expect(db.setData(999, "nope")).rejects.toThrow();
  });
});

describe(`deleteRecord()`, () => {
  it("returns false when no record has the given ID", async () => {
    expect(await db.deleteRecord(999)).toBe(false);
  });

  it("returns true and removes the record when it exists", async () => {
    const id = await db.newRecord("Alvin");
    await db.setData(id, "data");
    expect(await db.deleteRecord(id)).toBe(true);
    expect(await db.getRecord(id)).toBeUndefined();
  });

  it("removes the deleted ID from its name index", async () => {
    const id1 = await db.newRecord("Alvin");
    const id2 = await db.newRecord("Alvin");
    await db.deleteRecord(id1);
    expect(await db.nameToIDs("Alvin")).toStrictEqual([id2]);
  });

  it("leaves the name index empty once its last record is deleted", async () => {
    const id = await db.newRecord("Alvin");
    await db.deleteRecord(id);
    expect(await db.nameToIDs("Alvin")).toStrictEqual([]);
  });
});

describe(`clear()`, () => {
  it("removes all records", async () => {
    const id = await db.newRecord("Alvin");
    await db.setData(id, "data");
    await db.clear();
    expect(await db.getRecord(id)).toBeUndefined();
    expect(await db.nameToIDs("Alvin")).toStrictEqual([]);
  });
});
