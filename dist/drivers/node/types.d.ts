import type { ZodTypeDef } from "zod";
import { z } from "zod";
export declare const boolean: () => z.ZodEffects<z.ZodNumber, boolean, number>;
export declare const json: <T, U = T>(t?: z.ZodType<T, ZodTypeDef, U>) => z.ZodEffects<z.ZodString, T, string>;
