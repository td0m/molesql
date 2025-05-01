import { GenericSQL } from "./sql.ts";

export const createTaggedTemplate =
  <Param>() =>
  (literals: TemplateStringsArray, ...args: Param[]): GenericSQL<Param> => {
    const stmt = new GenericSQL<Param>();
    literals.raw.forEach((lit: string, i: number) => {
      if (i > 0) {
        const arg = args[i - 1];
        console.log(arg, arg instanceof GenericSQL);
        if (arg instanceof GenericSQL) {
          stmt.append(arg);
        } else if (i > 0 && arg !== undefined) {
          stmt.addParam(arg);
        }
      }
      stmt.append(new GenericSQL(lit));
    }, "");
    return stmt;
  };
