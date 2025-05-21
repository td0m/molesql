import { z } from "zod";

import { sqlite } from "./index.ts";

const { db, sql, migrations } = sqlite();

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
