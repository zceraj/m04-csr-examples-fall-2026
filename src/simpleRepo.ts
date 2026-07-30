import type { DataRecord, ISimpleDB } from "./ISimpleRepo.ts";

/**
 * A simple in-memory database that stores records keyed by a numeric ID.
 * Each record has a unique ID, a name, and arbitrary "other stuff" typed
 * via the generic parameter T.
 */

class SimpleDB<T> implements ISimpleDB<T> {
  private _records: Map<number, DataRecord<T>> = new Map();
  private _nameIndex: Map<string, Set<number>> = new Map();
  private _nextId: number = 1;

  /** Removes all records from the database. */
  clear(): void {
    this._records.clear();
    this._nameIndex.clear();
    this._nextId = 1;
  }

  /**
   * Creates a new record with the given name and an auto-assigned,
   * unique numeric ID. The "other stuff" (data) is left unset until
   * setData() is called. Returns the new record's ID.
   */
  newRecord(name: string): number {
    const id = this._nextId++;
    this._records.set(id, { id, name, data: undefined });

    const ids = this._nameIndex.get(name);
    if (ids) {
      ids.add(id);
    } else {
      this._nameIndex.set(name, new Set([id]));
    }

    return id;
  }

  /**
   * Deletes the record with the given ID. Returns true if a record
   * was found and deleted, false otherwise.
   */
  deleteRecord(id: number): boolean {
    const record = this._records.get(id);
    if (!record) {
      return false;
    }

    this._records.delete(id);

    const ids = this._nameIndex.get(record.name);
    if (ids) {
      ids.delete(id);
      if (ids.size === 0) {
        this._nameIndex.delete(record.name);
      }
    }

    return true;
  }

  /**
   * Sets the "other stuff" (data) for the record with the given ID.
   * Throws if no record with that ID exists.
   */
  setData(id: number, data: T): void {
    const record = this._records.get(id);
    if (!record) {
      throw new Error(`No record with ID ${id}`);
    }
    record.data = data;
  }

  /**
   * Gets the entire record (ID, name, and data) with the given ID.
   * Returns undefined only when no record with that ID exists; a record whose
   * data was never set is returned with its data field undefined.
   */
  getRecord(id: number): DataRecord<T> | undefined {
    return this._records.get(id);
  }

  /**
   * Returns the IDs of all records with the given name.
   * Returns an empty array if no records match.
   */
  nameToIDs(name: string): number[] {
    const ids = this._nameIndex.get(name);
    return ids ? Array.from(ids) : [];
  }
}

export { SimpleDB };
