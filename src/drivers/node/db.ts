import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import type { ZodType, ZodTypeDef } from "zod";

import { SqlNoRowsError, SqlRowParseError } from "../../errors.ts";

import type { SQL } from "./sql.ts";

export const createDB = (db: DatabaseSync) => {
  return {
    maybeOne: <T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL): T | undefined => {
      const stmt = db.prepare(sql.sql);
      // TODO: fix it?
      const row = stmt.get(...(sql.params as SQLInputValue[]));
      if (!row) {
        return undefined;
      }
      const parsed = t.safeParse(row);
      if (parsed.error) {
        throw new SqlRowParseError(sql.sql, parsed.error);
      }
      return parsed.data;
    },
    one<T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL): T {
      const result = this.maybeOne(t, sql);
      if (!result) {
        throw new SqlNoRowsError(sql.sql);
      }
      return result;
    },
    all: <T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL): T[] => {
      const stmt = db.prepare(sql.sql);
      const rows = stmt.all(...(sql.params as SQLInputValue[]));
      return rows.map((row) => t.parse(row));
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
