import { z } from "zod";

import type { DB, WriteTX } from "./db.ts";
import { sql } from "./sql.ts";
import * as t from "./types.ts";

type Migration = {
  name: string;
  run: (tx: WriteTX) => void;
};

export type Migrations = {
  add(name: string, tx: (db: WriteTX) => void): Migrations
  run(): void
}

export function migrations(db: DB): Migrations {
  const list: Migration[] = [];

  return {
    add(name: string, tx: (db: WriteTX) => void) {
      list.push({ name, run: tx });
      return this; // Enable chaining
    },
    run(table: string = "migrations") {
      const tableSQL = sql.unsafeLiteral(table);
      db.run(sql`
        CREATE TABLE IF NOT EXISTS ${tableSQL} (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("CREATED")
      for (let migration of list) {
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
                  name = ${migration.name}
              ) AS "exists"
          `,
        );
        if (migrationAlreadyExists) {
          console.debug(`✔️ migration ${migration.name} skipped. `);
          return;
        }
        db.run(sql`BEGIN TRANSACTION`);
        try {
          migration.run(db);
          db.run(sql`
            INSERT INTO
              ${tableSQL} (name)
            VALUES
              (${migration.name})
          `);
          console.info(`✅ migration ${migration.name} ran successfully.`);
          db.run(sql`COMMIT`);
        } catch (error) {
          db.run(sql`ROLLBACK`);
          throw error;
        }
      };
    },
  };
}

