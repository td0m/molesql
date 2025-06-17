import { z } from "zod";

import type { DB } from "./db.ts";
import { sql } from "./sql.ts";
import * as t from "./types.ts";

export type Migrations = ReturnType<typeof createMigrations>;

export function createMigrations(db: DB, table: string = "migrations") {
  const tableSQL = sql.unsafeLiteral(table);
  db.run(sql`
    CREATE TABLE IF NOT EXISTS ${tableSQL} (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const migrate = (name: string, f: (tx: DB) => void) => {
    const { exists: migrationAlreadyExists } = db.one(
      z.object({
        exists: t.boolean().optional(),
      }),
      sql`
        SELECT
          EXISTS (
            SELECT
              1
            FROM
              ${tableSQL}
            WHERE
              name = ${name}
          ) AS "exists"
      `,
    );
    if (migrationAlreadyExists) {
      console.debug(`✔️ migration ${name} skipped. `);
      return;
    }
    db.run(sql`BEGIN TRANSACTION`);
    try {
      f(db);
      db.run(sql`
        INSERT INTO
          ${tableSQL} (name)
        VALUES
          (${name})
      `);
      console.info(`✅ migration ${name} ran successfully.`);
      db.run(sql`COMMIT`);
    } catch (error) {
      db.run(sql`ROLLBACK`);
      throw error;
    }
  };
  return {
    listMigrations: () => {
      return db.run(sql`
        SELECT
          id,
          name,
          applied_at
        FROM
          ${tableSQL}
      `);
    },
    migrate,
  };
}
