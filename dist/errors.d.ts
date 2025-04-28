import type { ZodError } from "zod";
export declare class SqlRowParseError extends Error {
    private sql;
    private zodError;
    name: string;
    constructor(sql: string, zodError: ZodError);
}
export declare class SqlNoRowsError extends Error {
    private sql;
    name: string;
    constructor(sql: string);
}
