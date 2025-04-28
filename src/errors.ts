import type { ZodError } from "zod";

export class SqlRowParseError extends Error {
  override name = "SqlRowParseError";

  constructor(
    private sql: string,
    private zodError: ZodError,
  ) {
    super(zodError.message);
  }
}

export class SqlNoRowsError extends Error {
  override name = "SqlNoRowsError";

  constructor(private sql: string) {
    super(`No rows returned`);
  }
}
