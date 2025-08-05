import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import type { z, ZodObject } from "zod";

import { SqlNoRowsError, SqlRowParseError } from "../../errors.ts";

import type { SQL } from "./sql.ts";

export const createDB = (db: DatabaseSync) => {
  return {
    maybeOne: <T extends ZodObject>(schema: T, sql: SQL): z.infer<T> | undefined => {
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
    one<T extends ZodObject>(schema: T, sql: SQL): z.infer<T> {
      const result = this.maybeOne(schema, sql);
      if (!result) {
        throw new SqlNoRowsError(sql.sql);
      }
      return result;
    },
    // TODO: ensure each key in object has a default
    oneOrDefault<T extends ZodObject>(schema: T, sql: SQL): z.infer<T> {
      const result = this.maybeOne(schema, sql);
      if (!result) {
        return schema.parse({});
      }
      return result;
    },
    all: <T extends ZodObject>(schema: T, sql: SQL): z.infer<T>[] => {
      const stmt = db.prepare(sql.sql);
      const rows = stmt.all(...(sql.params as SQLInputValue[]));
      return rows.map((row) => schema.parse(row));
    },
    run: (sql: SQL) => {
      const stmt = db.prepare(sql.sql);
      stmt.run(...(sql.params as SQLInputValue[]));
    },
    // transaction: (fn: (db: DB) => void) => {
    //   db.tr
    // },
  };
};

export type DB = ReturnType<typeof createDB>;
