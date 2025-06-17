import { z } from "zod";
import { DatabaseSync } from "node:sqlite";

import { createDB } from "./drivers/node/db.ts";
import { sql } from "./drivers/node/sql.ts";
import { createMigrations } from "./drivers/node/migrations.ts";

const rawDB = new DatabaseSync(":memory:");
const db = createDB(rawDB);
const migrations = createMigrations(db);

migrations.migrate("init", (tx) => {
  tx.run(sql`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)`);
  tx.run(sql`
    INSERT INTO
      users (name)
    VALUES
      ('hello world')
  `);
});

const User = z.object({
  id: z.number(),
  name: z.string(),
});

const user = db.one(
  User,
  sql`
    SELECT
      *
    FROM
      users
  `,
);

console.log(user);
