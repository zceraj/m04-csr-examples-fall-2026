/**
 * The public interface of a persistent database that stores records keyed by
 * an auto-assigned numeric ID. Each record has a unique ID, a name, and
 * arbitrary "other stuff" typed via the generic parameter T.
 *
 * This is the persistent analogue of {@link ISimpleDB}. Because the backing
 * store may live outside the current process (a file, a remote service, etc.),
 * every operation is asynchronous and returns a Promise. A rejected Promise
 * signals that the operation could not be completed (e.g. a storage failure).
 */
interface IPersistentDB<T> {
  /** Removes all records from the database. */
  clear(): Promise<void>;

  /**
   * Creates a new record with the given name and an auto-assigned,
   * unique numeric ID. The "other stuff" (data) is left unset until
   * setData() is called. Resolves with the new record's ID.
   */
  newRecord(name: string): Promise<number>;

  /**
   * Deletes the record with the given ID. Resolves with true if a record
   * was found and deleted, false otherwise.
   */
  deleteRecord(id: number): Promise<boolean>;

  /**
   * Sets the "other stuff" (data) for the record with the given ID.
   * Rejects if no record with that ID exists.
   */
  setData(id: number, data: T): Promise<void>;

  /**
   * Gets the "other stuff" (data) for the record with the given ID.
   * Resolves with undefined if no record exists, or if data was never set.
   */
  getData(id: number): Promise<T | undefined>;

  /**
   * Returns the IDs of all records with the given name.
   * Resolves with an empty array if no records match.
   */
  nameToIDs(name: string): Promise<number[]>;
}

export { type IPersistentDB };
