import { z } from "zod";
import yaml from "yaml";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { Snowflake } from "./snowflake";
import { BigQuery } from "./bigquery";
import { Redshift } from "./redshift";
import {
  DatabaseNotSupportedError,
  ParseError,
  ProfileNotFoundError,
  TargetNotFoundError,
} from "../errors";
import { Postgres } from "./postgres";
import type { Credentials } from "../types";
import os from "os";
import { jinja } from "../jinja";
import path from "path";
import { createPathOptions, readFile } from "../utils";

export async function readDbtProfile(
  filePath?: string
): Promise<Result<DbtProfile, Error>> {
  const dbtProfile = readFile(
    createPathOptions([
      filePath,
      path.resolve(
        process.env["DBT_PROFILES_DIR"] ?? process.cwd(),
        "profiles"
      ),
      path.resolve(os.homedir(), ".dbt/profiles"),
    ])
  );

  return dbtProfile
    .andThen((fileContents) => jinja.template(fileContents))
    .andThen(DbtProfile.fromYamlString);
}

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

const DB_ADAPTERS = {
  snowflake: Snowflake,
  bigquery: BigQuery,
  redshift: Redshift,
  postgres: Postgres,
};

export const SUPPORTED_DATABASES = Object.keys(DB_ADAPTERS) as Array<
  keyof typeof DB_ADAPTERS
>;

export class DbtProfile {
  constructor(private config: DbtProfileConfig) {}

  static fromYamlString(profile: string): Result<DbtProfile, ParseError> {
    const config = yaml.parse(profile);
    const result = dbtProfileSchema.safeParse(config);

    if (!result.success) {
      return err(new ParseError(result.error.message));
    }

    return ok(new DbtProfile(config));
  }

  static fromFile(filePath?: string) {
    return readDbtProfile(filePath);
  }

  credentials(
    profile: string,
    target?: string
  ): Result<
    Credentials,
    ProfileNotFoundError | TargetNotFoundError | DatabaseNotSupportedError
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
