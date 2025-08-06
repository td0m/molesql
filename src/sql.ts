
// SQL class holds both the sql query string and the bind parameters
export class SQL {
  private _query: string[] = [];
  private _params: Param[] = [];

  constructor(query?: string) {
    if (query) this._query.push(query);
  }

  toString(): string {
    // nicely formats the sql string
    return `query: ${this.sql.replace(/ {2,}/, " ")}, params: ${JSON.stringify(this.params)}`;
  }

  append(other: SQL): void {
    this._params.push(...other._params);
    this._query.push(...other._query);
  }

  get sql(): string {
    return this._query.join("");
  }

  get params(): Param[] {
    return this._params;
  }

  addParam(param: Param): void {
    this._params.push(param);
    this._query.push("?");
  }

  isSQL(arg: unknown): arg is SQL {
    return arg instanceof SQL;
  }
}

// Uint8Array<ArrayBuffer> is used for things like sqlite-vec
export type Param = string | number | null | Uint8Array<ArrayBuffer> | SQL;

type Tag = {
  (literals: TemplateStringsArray, ...args: Param[]): SQL;
  boolean: (b: boolean) => number;
  join: (args: Param[], joiner: SQL) => SQL;
  where: (...args: (Param | false)[]) => SQL;
  // careful, this is dangerous
  unsafeLiteral: (unsafeRawSQL: string) => SQL;
};

// sql safely constructs an instance of SQL from a tagged template literal
// e.g. sql`select id from users where email=${email}` will be safely turned into:
//      { query: 'select id from users where email=?', params: [email] }
export const sql: Tag = (literals: TemplateStringsArray, ...args: Param[]): SQL => {
    const stmt = new SQL();
    literals.raw.forEach((lit: string, i: number) => {
      if (i > 0) {
        const arg = args[i - 1];
        if (arg instanceof SQL) {
          stmt.append(arg);
        } else if (i > 0 && arg !== undefined) {
          stmt.addParam(arg);
        }
      }
      stmt.append(new SQL(lit));
    }, "");
    return stmt;
  };

sql.boolean = (b: boolean) => (b ? 1 : 0);

// e.g. sql.join([sql`name IS NOT NULL`, sql`is_archived = ${0}`], sql` AND `)
sql.join = (args: Param[], joiner: SQL): SQL => {
    if (args.length === 0) return new SQL();
    const stmt = new SQL();
    args.forEach((arg, i) => {
      if (stmt.isSQL(arg)) stmt.append(arg);
      else stmt.addParam(arg);
      if (i < args.length - 1) stmt.append(joiner);
    });
    return stmt;
  };


sql.where = (...args: (Param | false)[]) => {
  const filteredArgs = args.filter((arg) => arg !== false);
  if (filteredArgs.length === 0) {
    return sql``;
  }
  return sql`
    WHERE
      ${sql.join(filteredArgs, sql` AND `)}
  `;
};

sql.unsafeLiteral = (unsafeRawSQL: string) => {
  return new SQL(unsafeRawSQL);
};
