import { createJoin } from "../../util/create-join.ts";
import type { GenericSQL as GenericSQL } from "../../util/sql.ts";
import { createTaggedTemplate } from "../../util/tagged-template.ts";

type Param = string | number | null | Record<string, unknown> | Array<unknown> | GenericSQL<Param>;

export type SQL = GenericSQL<Param>;

type Tag = {
  (literals: TemplateStringsArray, ...args: Param[]): SQL;
  boolean: (b: boolean) => number;
  join: (args: Param[], joiner: SQL) => SQL;
};

// sql safely constructs an instance of SQL from a tagged template literal
// e.g. sql`select id from users where email=${email}` will be safely turned into:
//      { query: 'select id from users where email=?', params: [email] }
export const sql = createTaggedTemplate<Param>() as Tag;

sql.boolean = (b: boolean) => (b ? 1 : 0);

// e.g. sql.join([sql`name IS NOT NULL`, sql`is_archived = ${0}`], sql` AND `)
sql.join = createJoin<Param>();
