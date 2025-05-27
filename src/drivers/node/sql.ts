import { createJoin } from "../../util/create-join.ts";
import { GenericSQL } from "../../util/sql.ts";
import { createTaggedTemplate } from "../../util/tagged-template.ts";

// Uint8Array<ArrayBuffer> is used for things like sqlite-vec
export type Param = string | number | null | Uint8Array<ArrayBuffer> | GenericSQL<Param>;

export type SQL = GenericSQL<Param>;

type Tag = {
  (literals: TemplateStringsArray, ...args: Param[]): SQL;
  boolean: (b: boolean) => number;
  join: (args: Param[], joiner: SQL) => SQL;
  where: (...args: (Param | undefined)[]) => SQL;
  // careful, this is dangerous
  unsafeLiteral: (unsafeRawSQL: string) => SQL;
};

// sql safely constructs an instance of SQL from a tagged template literal
// e.g. sql`select id from users where email=${email}` will be safely turned into:
//      { query: 'select id from users where email=?', params: [email] }
export const sql = createTaggedTemplate<Param>() as Tag;

sql.boolean = (b: boolean) => (b ? 1 : 0);

// e.g. sql.join([sql`name IS NOT NULL`, sql`is_archived = ${0}`], sql` AND `)
sql.join = createJoin<Param>();

sql.where = (...args: (Param | undefined)[]) => {
  const filteredArgs = args.filter((arg) => arg !== undefined);
  if (filteredArgs.length === 0) {
    return sql``;
  }
  return sql`
    WHERE
      ${sql.join(filteredArgs, sql` AND `)}
  `;
};

sql.unsafeLiteral = (unsafeRawSQL: string) => {
  return new GenericSQL<Param>(unsafeRawSQL);
};
