export declare class SQL {
    _query: string[];
    _params: unknown[];
    constructor(query?: string);
    toString(): string;
    append(other: SQL): void;
    get sql(): string;
    get params(): unknown[];
    addParam(param: unknown): void;
}
type SQLArg = string | number | SQL | null;
export declare function sql(literals: TemplateStringsArray, ...args: SQLArg[]): SQL;
export declare namespace sql {
    var boolean: (b: boolean) => 0 | 1;
}
export {};
