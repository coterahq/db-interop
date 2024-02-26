import { err, ok, type Result } from "neverthrow";
import { z } from "zod";
import { ParseError } from "../errors";

const schema = z.object({
  type: z.literal("snowflake"),
  account: z.string(),
  database: z.string(),
  user: z.string(),
  password: z.string(),
  role: z.string(),
  port: z.coerce.number(),
  warehouse: z.string(),
  schema: z.string(),
});

export type SnowflakeCredentials = z.infer<typeof schema>

export class Snowflake {
  constructor() {}

  static fromConfig(config: object): Result<SnowflakeCredentials, ParseError> {
    const result = schema.safeParse(config);

    if(!result.success) {
      return err(new ParseError(result.error.message));
    }

    return ok(result.data);
  }
}