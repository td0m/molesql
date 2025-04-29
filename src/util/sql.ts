// SQL class holds both the sql query string and the bind parameters
export class GenericSQL<Param> {
  private _query: string[] = [];
  private _params: Param[] = [];

  constructor(query?: string) {
    if (query) this._query.push(query);
  }

  toString(): string {
    // nicely formats the sql string
    return `query: ${this.sql.replace(/ {2,}/, " ")}, params: ${JSON.stringify(this.params)}`;
  }

  append(other: GenericSQL<Param>): void {
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

  isSQL(arg: unknown): arg is GenericSQL<Param> {
    return arg instanceof GenericSQL;
  }
}
