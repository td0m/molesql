import { z } from "zod";
import { createDB, sql, migrations } from "./src/index.ts";

const db = createDB(":memory:");

migrations(db)
  .add("create users table", (tx) =>
    tx.run(sql`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)`),
  )
  .add("setup users", (tx) =>
    tx.run(sql`
      INSERT INTO
        users (name)
      VALUES
        ('hello world')
    `),
  )
  .run();

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
