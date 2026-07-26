/**
 * The public interface of a simple in-memory database that stores records
 * keyed by an auto-assigned numeric ID. Each record has a unique ID, a name,
 * and arbitrary "other stuff" typed via the generic parameter T.
 */
interface ISimpleDB<T> {
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
   * Gets the "other stuff" (data) for the record with the given ID.
   * Returns undefined if no record exists, or if data was never set.
   */
  getData(id: number): T | undefined;

  /**
   * Returns the IDs of all records with the given name.
   * Returns an empty array if no records match.
   */
  nameToIDs(name: string): number[];
}

export { type ISimpleDB };
