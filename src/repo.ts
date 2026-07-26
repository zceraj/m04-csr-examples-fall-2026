import type { ISimpleDB } from "./ISimpleDB.ts";

/**
 * A simple in-memory database that stores records keyed by a numeric ID.
 * Each record has a unique ID, a name, and arbitrary "other stuff" typed
 * via the generic parameter T.
 */

interface Record<T> {
  id: number;
  name: string;
  data: T | undefined;
}

class SimpleDB<T> implements ISimpleDB<T> {
  private records: Map<number, Record<T>> = new Map();
  private nameIndex: Map<string, Set<number>> = new Map();
  private nextId: number = 1;

  /** Removes all records from the database. */
  clear(): void {
    this.records.clear();
    this.nameIndex.clear();
    this.nextId = 1;
  }

  /**
   * Creates a new record with the given name and an auto-assigned,
   * unique numeric ID. The "other stuff" (data) is left unset until
   * setData() is called. Returns the new record's ID.
   */
  newRecord(name: string): number {
    const id = this.nextId++;
    this.records.set(id, { id, name, data: undefined });

    const ids = this.nameIndex.get(name);
    if (ids) {
      ids.add(id);
    } else {
      this.nameIndex.set(name, new Set([id]));
    }

    return id;
  }

  /**
   * Deletes the record with the given ID. Returns true if a record
   * was found and deleted, false otherwise.
   */
  deleteRecord(id: number): boolean {
    const record = this.records.get(id);
    if (!record) {
      return false;
    }

    this.records.delete(id);

    const ids = this.nameIndex.get(record.name);
    if (ids) {
      ids.delete(id);
      if (ids.size === 0) {
        this.nameIndex.delete(record.name);
      }
    }

    return true;
  }

  /**
   * Sets the "other stuff" (data) for the record with the given ID.
   * Throws if no record with that ID exists.
   */
  setData(id: number, data: T): void {
    const record = this.records.get(id);
    if (!record) {
      throw new Error(`No record with ID ${id}`);
    }
    record.data = data;
  }

  /**
   * Gets the "other stuff" (data) for the record with the given ID.
   * Returns undefined if no record exists, or if data was never set.
   */
  getData(id: number): T | undefined {
    return this.records.get(id)?.data;
  }

  /**
   * Returns the IDs of all records with the given name.
   * Returns an empty array if no records match.
   */
  nameToIDs(name: string): number[] {
    const ids = this.nameIndex.get(name);
    return ids ? Array.from(ids) : [];
  }
}

export { SimpleDB, type Record };