import { Keyv } from "keyv";

import type { DataRecord } from "../withSimpleRepo/ISimpleRepo.ts";
import type { IPersistentDB } from "./IPersistentRepo.ts";

/**
 * A persistent database backed by keyv. Records are keyed by an auto-assigned
 * numeric ID; each has a unique ID, a name, and arbitrary "other stuff" typed
 * via the generic parameter T.
 *
 * keyv defaults to an in-memory Map store, so for now everything lives in-core.
 * Passing a keyv instance backed by a real adapter (SQLite, Postgres, Redis,
 * ...) to the constructor migrates this to durable storage with no other code
 * changes.
 *
 * Records are found by name via an explicit name index stored alongside the
 * records. We keep our own index rather than iterating the store because
 * iteration is not supported by every keyv adapter, whereas point reads and
 * writes are.
 *
 * NOTE: The read-modify-write sequences below (advancing the ID counter,
 * updating the name index) are not atomic. This is safe for sequential use but
 * could race under concurrent calls; a durable backend would need transactions
 * or atomic counters to be concurrency-safe.
 */

/** keyv key under which the next-ID counter is stored. */
const NEXT_ID_KEY = "meta:nextId";

/** keyv key for the record with the given ID. */
function recordKey(id: number): string {
  return `record:${id}`;
}

/** keyv key for the name index of the given name. */
function nameKey(name: string): string {
  return `name:${name}`;
}

class KeyvDB<T> implements IPersistentDB<T> {
  private _store: Keyv;

  /**
   * @param store the keyv instance to persist to. Defaults to keyv's in-memory
   * Map store. Supply an adapter-backed instance for durable storage.
   */
  constructor(store: Keyv = new Keyv()) {
    this._store = store;
  }

  /** Removes all records from the database. */
  async clear(): Promise<void> {
    await this._store.clear();
  }

  /**
   * Creates a new record with the given name and an auto-assigned,
   * unique numeric ID. The "other stuff" (data) is left unset until
   * setData() is called. Resolves with the new record's ID.
   */
  async newRecord(name: string): Promise<number> {
    const id = (await this._store.get<number>(NEXT_ID_KEY)) ?? 1;
    await this._store.set(NEXT_ID_KEY, id + 1);
    await this._store.set(recordKey(id), { id, name, data: undefined });

    const ids = (await this._store.get<number[]>(nameKey(name))) ?? [];
    await this._store.set(nameKey(name), [...ids, id]);

    return id;
  }

  /**
   * Deletes the record with the given ID. Resolves with true if a record
   * was found and deleted, false otherwise.
   */
  async deleteRecord(id: number): Promise<boolean> {
    const record = await this._store.get<DataRecord<T>>(recordKey(id));
    if (!record) {
      return false;
    }

    await this._store.delete(recordKey(id));

    const ids = (await this._store.get<number[]>(nameKey(record.name))) ?? [];
    const remaining = ids.filter((other) => other !== id);
    if (remaining.length === 0) {
      await this._store.delete(nameKey(record.name));
    } else {
      await this._store.set(nameKey(record.name), remaining);
    }

    return true;
  }

  /**
   * Sets the "other stuff" (data) for the record with the given ID.
   * Rejects if no record with that ID exists.
   */
  async setData(id: number, data: T): Promise<void> {
    const record = await this._store.get<DataRecord<T>>(recordKey(id));
    if (!record) {
      throw new Error(`No record with ID ${id}`);
    }
    await this._store.set(recordKey(id), { ...record, data });
  }

  /**
   * Gets the entire record (ID, name, and data) with the given ID.
   * Resolves with undefined only when no record with that ID exists; a record
   * whose data was never set resolves with its data field undefined.
   */
  async getRecord(id: number): Promise<DataRecord<T> | undefined> {
    return this._store.get<DataRecord<T>>(recordKey(id));
  }

  /**
   * Returns the IDs of all records with the given name.
   * Resolves with an empty array if no records match.
   */
  async nameToIDs(name: string): Promise<number[]> {
    return (await this._store.get<number[]>(nameKey(name))) ?? [];
  }
}

export { KeyvDB };
