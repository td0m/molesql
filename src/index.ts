export * from "./errors.ts";
export { GenericSQL } from "./util/sql.ts";

import { DatabaseSync, type DatabaseSyncOptions } from "node:sqlite";

import * as nodeSqlite from "./drivers/node/index.ts";

export type Sqlite = {
  db: nodeSqlite.DB;
  sql: typeof nodeSqlite.sql;
  migrations: ReturnType<typeof nodeSqlite.createMigrations>;
  t: typeof nodeSqlite.t;
  rawdb: DatabaseSync;
};

export function sqlite(path?: string | Buffer | URL, options?: DatabaseSyncOptions): Sqlite;
export function sqlite(path: DatabaseSync): Sqlite;

export function sqlite(
  pathOrDB: string | Buffer | URL | DatabaseSync = ":memory:",
  options?: DatabaseSyncOptions,
) {
  if (!options) {
    options = {};
  }
  const dbsync = pathOrDB instanceof DatabaseSync ? pathOrDB : new DatabaseSync(pathOrDB, options);
  const db = nodeSqlite.createDB(dbsync);
  return {
    db,
    sql: nodeSqlite.sql,
    migrations: nodeSqlite.createMigrations(db),
    t: nodeSqlite.t,
    rawdb: dbsync,
  };
}
