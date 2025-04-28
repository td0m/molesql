import type { DatabaseSync } from "node:sqlite";
import type { ZodType, ZodTypeDef } from "zod";
import type { SQL } from "./sql.ts";
export declare const createDB: (db: DatabaseSync) => {
    maybeOne: <T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL) => T | undefined;
    one<T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL): T;
    all: <T, U = T>(t: ZodType<T, ZodTypeDef, U>, sql: SQL) => T[];
    run: (sql: SQL) => void;
};
