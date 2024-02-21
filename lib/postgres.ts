import { err, ok, type Result } from "neverthrow";
import { z } from "zod";
import { ParseError } from "./errors";

const schema = z.object({
  type: z.literal('postgres'),
  host: z.string(),
  port: z.coerce.number(),
  user: z.string(),
  password: z.string(),
  dbname: z.string(),
  schema: z.string(),
  threads: z.number().optional(),
  sslmode: z.enum(['disable', 'require', 'verify-ca', 'verify-full']).optional(),
});

export type PostgresCredentials = z.infer<typeof schema>

export class Postgres {
  constructor() {}

  static fromConfig(config: object): Result<PostgresCredentials, ParseError> {
    const result = schema.safeParse(config);

    if(!result.success) {
      return err(new ParseError(result.error.message));
    }

    return ok(result.data);
  }
}