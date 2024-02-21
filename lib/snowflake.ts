import { err, ok, type Result } from "neverthrow";
import { z } from "zod";
import { ParseError } from "./errors";

const schema = z.object({
  type: z.literal("snowflake"),
  account: z.string().optional(),
  database: z.string().optional(),
  host: z.string().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  role: z.string().optional(),
  port: z.number().optional(),
  warehouse: z.string().optional(),
  schema: z.string().optional(),
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