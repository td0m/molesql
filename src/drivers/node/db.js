import { SqlNoRowsError, SqlRowParseError } from "../../errors.js";
export const createDB = (db) => {
    return {
        maybeOne: (t, sql) => {
            const stmt = db.prepare(sql.sql);
            // TODO: fix it?
            const row = stmt.get(...sql.params);
            if (!row) {
                return undefined;
            }
            const parsed = t.safeParse(row);
            if (parsed.error) {
                throw new SqlRowParseError(sql.sql, parsed.error);
            }
            return parsed.data;
        },
        one(t, sql) {
            const result = this.maybeOne(t, sql);
            if (!result) {
                throw new SqlNoRowsError(sql.sql);
            }
            return result;
        },
        all: (t, sql) => {
            const stmt = db.prepare(sql.sql);
            const rows = stmt.all(...sql.params);
            return rows.map((row) => t.parse(row));
        },
        run: (sql) => {
            const stmt = db.prepare(sql.sql);
            stmt.run(...sql.params);
        },
    };
};
