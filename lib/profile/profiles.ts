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

export async function readDbtProfiles(
  filePath?: string
): Promise<Result<DbtProfiles, Error>> {
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
    .andThen(DbtProfiles.fromYamlString);
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

export class DbtProfiles {
  constructor(readonly config: DbtProfileConfig) {}

  static fromYamlString(profile: string): Result<DbtProfiles, ParseError> {
    const config = yaml.parse(profile);
    const result = dbtProfileSchema.safeParse(config);

    if (!result.success) {
      return err(new ParseError(result.error.message));
    }

    return ok(new DbtProfiles(config));
  }

  static fromFile(filePath?: string) {
    return readDbtProfiles(filePath);
  }

  list(): string[] {
    return Object.keys(this.config);
  }

  profile(profile: string): Result<DbtProfile, ProfileNotFoundError> {
    const envConfig = this.config[profile];

    if (!envConfig) {
      return err(new ProfileNotFoundError(profile));
    }

    return ok(new DbtProfile(profile, envConfig));
  }
}

export class DbtProfile {
  constructor(readonly name: string, readonly config: DbtProfileConfig[number]) {}

  credentials(
    target?: string
  ): Result<
    Credentials,
    TargetNotFoundError | DatabaseNotSupportedError
  > {
    const targetConfig = this.config.outputs[target ?? this.config.target];

    if (!targetConfig) {
      return err(new TargetNotFoundError(target ?? this.config.target));
    }

    const adapter = DB_ADAPTERS[targetConfig.type as keyof typeof DB_ADAPTERS];

    if (!adapter) {
      return err(new DatabaseNotSupportedError(targetConfig.type));
    }

    return adapter.fromConfig(targetConfig);
  }

  targets(): string[] {
    return Object.keys(this.config.outputs);
  }
}