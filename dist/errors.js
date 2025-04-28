export class SqlRowParseError extends Error {
    sql;
    zodError;
    name = "SqlRowParseError";
    constructor(sql, zodError) {
        super(zodError.message);
        this.sql = sql;
        this.zodError = zodError;
    }
}
export class SqlNoRowsError extends Error {
    sql;
    name = "SqlNoRowsError";
    constructor(sql) {
        super(`No rows returned`);
        this.sql = sql;
    }
}
