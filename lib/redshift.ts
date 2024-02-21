import { err, ok, type Result } from "neverthrow";
import { z } from "zod";
import { ParseError } from "./errors";

const schema = z.object({
  type: z.literal('redshift'), // Ensures the type is exactly 'redshift'
  host: z.string(),
  port: z.coerce.number(),
  user: z.string(),
  pass: z.string(),
  dbname: z.string(),
  schema: z.string(),
  threads: z.number().optional(),
  sslmode: z.enum(['disable', 'require', 'verify-ca', 'verify-full']).optional(),
});


export type RedshiftCredentials = z.infer<typeof schema>

export class Redshift {
  constructor() {}

  static fromConfig(config: object): Result<RedshiftCredentials, ParseError> {
    const result = schema.safeParse(config);

    if(!result.success) {
      return err(new ParseError(result.error.message));
    }

    return ok(result.data);
  }
}