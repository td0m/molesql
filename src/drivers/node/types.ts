import type { ZodTypeDef } from "zod";
import { z } from "zod";

export const boolean = () => z.number().transform((v) => v === 1);

export const json = <T, U = T>(t: z.ZodType<T, ZodTypeDef, U> = z.any()) =>
  z.string().transform((v) => t.parse(JSON.parse(v)));
