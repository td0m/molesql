import { DatabaseSync, type DatabaseSyncOptions, type SQLInputValue } from "node:sqlite";
import type { z, ZodAny, ZodObject } from "zod";
import { SqlNoRowsError, SqlRowParseError } from "./errors.ts";
import type { SQL } from "./sql.ts";

type ObjectOrAny = ZodObject | ZodAny;

const reader = (db: DatabaseSync) => {
  return {
    maybeOne: <T extends ObjectOrAny>(schema: T, sql: SQL): z.infer<T> | undefined => {
      const stmt = db.prepare(sql.sql);
      // TODO: fix it?
      const row = stmt.get(...(sql.params as SQLInputValue[]));
      if (!row) {
        return undefined;
      }
      const parsed = schema.safeParse(row);
      if (parsed.error) {
        throw new SqlRowParseError(sql.sql, parsed.error);
      }
      return parsed.data;
    },
    one<T extends ObjectOrAny>(schema: T, sql: SQL): z.infer<T> {
      const result = this.maybeOne(schema, sql);
      if (!result) {
        throw new SqlNoRowsError(sql.sql);
      }
      return result;
    },
    // TODO: ensure each key in object has a default
    oneOrDefault<T extends ObjectOrAny>(schema: T, sql: SQL): z.infer<T> {
      const result = this.maybeOne(schema, sql);
      if (!result) {
        return schema.parse({});
      }
      return result;
    },
    all: <T extends ObjectOrAny>(schema: T, sql: SQL): z.infer<T>[] => {
      const stmt = db.prepare(sql.sql);
      const rows = stmt.all(...(sql.params as SQLInputValue[]));
      return rows.map((row) => schema.parse(row));
    },
  };
};

const writer = (db: DatabaseSync) => {
  return {
    run: (sql: SQL) => {
      const stmt = db.prepare(sql.sql);
      stmt.run(...(sql.params as SQLInputValue[]));
    },
  };
};

export type ReadTX = ReturnType<typeof reader>;
export type WriteTX = ReturnType<typeof writer>;

// will use "good defaults" when passed a path, with options being overriden with opts
export function createDB(
  path: string,
  options?: { overrides?: DatabaseSyncOptions; memory?: boolean },
) {
  // if we use an in memory db, we can't split reads+writes.
  const sameReaderAndWriter = options?.memory || path === ":memory:";
  const opts: DatabaseSyncOptions = {
    enableForeignKeyConstraints: true,
    ...options?.overrides,
  };
  const setupDB = (db: DatabaseSync) => {
    db.exec("PRAGMA journal_mode = WAL2");
  };
  const writeDB = new DatabaseSync(path, { ...opts, readOnly: false });
  const readDB = sameReaderAndWriter
    ? writeDB
    : new DatabaseSync(path, { ...opts, readOnly: true });
  setupDB(writeDB);
  !sameReaderAndWriter && setupDB(readDB);
  return {
    ...reader(readDB),
    ...writer(writeDB),
    readTX: (f: (db: ReadTX) => void) => {
      const session = readDB.createSession();
      f(reader(readDB));
      const changeset = session.changeset();
      readDB.applyChangeset(changeset);
    },
    writeTX: (f: (db: WriteTX) => void) => {
      const session = writeDB.createSession();
      f(writer(writeDB));
      const changeset = session.changeset();
      writeDB.applyChangeset(changeset);
    },
  };
}

export type DB = ReturnType<typeof createDB>;
