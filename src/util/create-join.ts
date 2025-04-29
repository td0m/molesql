import { GenericSQL } from "./sql.ts";

export const createJoin =
  <Param>() =>
  (args: Param[], joiner: GenericSQL<Param>): GenericSQL<Param> => {
    if (args.length === 0) return new GenericSQL<Param>();
    const stmt = new GenericSQL<Param>();
    args.forEach((arg, i) => {
      if (stmt.isSQL(arg)) stmt.append(arg);
      else stmt.addParam(arg);
      if (i < args.length - 1) stmt.append(joiner);
    });
    return stmt;
  };
