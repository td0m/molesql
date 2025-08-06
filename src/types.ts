import type { ZodObject } from "zod";
import { z } from "zod";

export const boolean = () => z.number().transform((v) => v === 1);

export const json = <T extends ZodObject>(t: T) =>
  z.string().transform((v) => t.parse(JSON.parse(v)));
