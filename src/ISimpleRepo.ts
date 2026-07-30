/**
 * A record stored in the database: a unique numeric ID, a name, and arbitrary
 * "other stuff" (data) typed via the generic parameter T. The data is left
 * unset (undefined) until setData() is called.
 */
interface DataRecord<T> {
  id: number;
  name: string;
  data: T | undefined;
}

/**
 * The public interface of a simple in-memory database that stores records
 * keyed by an auto-assigned numeric ID. Each record has a unique ID, a name,
 * and arbitrary "other stuff" typed via the generic parameter T.
 */
interface ISimpleRepo<T> {
  /** Removes all records from the database. */
  clear(): void;

  /**
   * Creates a new record with the given name and an auto-assigned,
   * unique numeric ID. The "other stuff" (data) is left unset until
   * setData() is called. Returns the new record's ID.
   */
  newRecord(name: string): number;

  /**
   * Deletes the record with the given ID. Returns true if a record
   * was found and deleted, false otherwise.
   */
  deleteRecord(id: number): boolean;

  /**
   * Sets the "other stuff" (data) for the record with the given ID.
   * Throws if no record with that ID exists.
   */
  setData(id: number, data: T): void;

  /**
   * Gets the entire record (ID, name, and data) with the given ID.
   * Returns undefined only when no record with that ID exists; a record whose
   * data was never set is returned with its data field undefined.
   */
  getRecord(id: number): DataRecord<T> | undefined;

  /**
   * Returns the IDs of all records with the given name.
   * Returns an empty array if no records match.
   */
  nameToIDs(name: string): number[];
}

export { type DataRecord, type ISimpleRepo as ISimpleDB };
