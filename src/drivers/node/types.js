import { z } from "zod";
export const boolean = () => z.number().transform((v) => v === 1);
export const json = (t = z.any()) => z.string().transform((v) => t.parse(JSON.parse(v)));
