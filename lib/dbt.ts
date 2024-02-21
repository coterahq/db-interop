import { z } from "zod";
import yaml from "yaml";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { Snowflake, type SnowflakeCredentials } from "./snowflake";
import { BigQuery, type BigQueryCredentials } from "./bigquery";
import { Redshift, type RedshiftCredentials } from "./redshift";
import { ParseError } from "./errors";
import { Postgres, type PostgresCredentials } from "./postgres";
import type { Credentials } from "./types";

const dbConfigSchema = z.object({
  type: z.string(),
});

const outputSchema = z.record(dbConfigSchema);

const environmentSchema = z.object({
  target: z.string(),
  outputs: outputSchema,
});

const dbtProfileSchema = z.record(environmentSchema);

type DbtProfileConfig = z.infer<typeof dbtProfileSchema>;

class TargetNotFoundError extends Error {
  constructor(name: string) {
    super(`Target not found: ${name}`);
  }
}

class ProfileNotFoundError extends Error {
  constructor(name: string) {
    super(`Profile not found: ${name}`);
  }
}


class DatabaseNotSupportedError extends Error {
  constructor(type: string) {
    super(`Database not supported: ${type}`);
  }
}

const DB_ADAPTERS = {
  snowflake: Snowflake,
  bigquery: BigQuery,
  redshift: Redshift,
  postgres: Postgres,
};

export class DbtProfile {
  constructor(private config: DbtProfileConfig) {}

  static fromFile(profile: string): Result<DbtProfile, Error> {
    const config = yaml.parse(profile);
    const result = dbtProfileSchema.safeParse(config);

    if (!result.success) {
      return err(new ParseError(result.error.message));
    }

    return ok(new DbtProfile(config));
  }

  credentials(
    profile: string,
    target?: string
  ): Result<
    Credentials,
    Error
  > {
    const envConfig = this.config[profile];

    if (!envConfig) {
      return err(new ProfileNotFoundError(profile));
    }

    const targetConfig = envConfig.outputs[target ?? envConfig.target];

    if (!targetConfig) {
      return err(new TargetNotFoundError(target ?? envConfig.target));
    }

    const adapter = DB_ADAPTERS[targetConfig.type as keyof typeof DB_ADAPTERS];

    if (!adapter) {
      return err(new DatabaseNotSupportedError(targetConfig.type));
    }

    return adapter.fromConfig(targetConfig);
  }

  list(): string[] {
    return Object.keys(this.config);
  }
}
