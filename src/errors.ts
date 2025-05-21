import type { ZodError } from "zod";

export class SqlRowParseError extends Error {
  override name = "SqlRowParseError";

  private sql: string;
  private zodError: ZodError;

  constructor(sql: string, zodError: ZodError) {
    super(zodError.message);
    this.sql = sql;
    this.zodError = zodError;
  }
}

export class SqlNoRowsError extends Error {
  override name = "SqlNoRowsError";

  private sql: string;

  constructor(sql: string) {
    super(`No rows returned`);
    this.sql = sql;
  }
}
