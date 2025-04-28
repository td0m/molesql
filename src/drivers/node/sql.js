// SQL class holds both the sql query string and the bind parameters
export class SQL {
    _query = [];
    _params = [];
    constructor(query) {
        if (query)
            this._query.push(query);
    }
    toString() {
        // nicely formats the sql string
        return `query: ${this.sql.replace(/ {2,}/, " ")}, params: ${JSON.stringify(this.params)}`;
    }
    append(other) {
        this._params.push(...other._params);
        this._query.push(...other._query);
    }
    get sql() {
        return this._query.join("");
    }
    get params() {
        return this._params;
    }
    addParam(param) {
        this._params.push(param);
        this._query.push("?");
    }
}
// sql safely constructs an instance of SQL from a tagged template literal
// e.g. sql`select id from users where email=${email}` will be safely turned into:
//      { query: 'select id from users where email=?', params: [email] }
export function sql(literals, ...args) {
    const stmt = new SQL();
    literals.raw.forEach((lit, i) => {
        if (i > 0) {
            const arg = args[i - 1];
            if (arg instanceof SQL) {
                stmt.append(arg);
            }
            else if (i > 0) {
                stmt.addParam(arg);
            }
        }
        stmt.append(new SQL(lit));
    }, "");
    return stmt;
}
sql.boolean = (b) => (b ? 1 : 0);
