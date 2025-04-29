import type { Pool } from "pg";
import type { ZodType, ZodTypeDef } from "zod";
import { z } from "zod";

import { SqlNoRowsError, SqlRowParseError } from "../../errors.ts";

import type { SQL } from "./sql.ts";

export const createDB = (db: Pool) => {
  return {
    all: async <T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL): Promise<T[]> => {
      const res = await db.query(sql.sql, sql.params);
      const arrayType = z.array(t);
      return arrayType.parse(res.rows);
    },
    maybeOne: async <T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL): Promise<T | undefined> => {
      const res = await db.query(sql.sql, sql.params);
      // TODO: fix it?
      if (res.rows.length === 0) {
        return undefined;
      }
      const row = res.rows[0] as unknown;
      const parsed = t.safeParse(row);
      if (parsed.error) {
        throw new SqlRowParseError(sql.sql, parsed.error);
      }
      return parsed.data;
    },
    async one<T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL): Promise<T> {
      const result = await this.maybeOne(t, sql);
      if (!result) {
        throw new SqlNoRowsError(sql.sql);
      }
      return result;
    },
    run: (sql: SQL) => {
      return db.query(sql.sql, sql.params);
    },
  };
};
