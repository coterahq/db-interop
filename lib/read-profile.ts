import fs from "fs";
import { Result, err } from "neverthrow";
import os from "os";
import { DbtProfile } from "./dbt";
import { jinja } from "./jinja";
import path from "path";
import { createPathOptions, readFile } from "./utils";

const createProfilePaths = (filePath?: string) => {
  const homeDirectory = os.homedir();

  return createPathOptions([
    filePath,
    path.resolve(process.env["DBT_PROFILES_DIR"] ?? __dirname, "profiles"),
    path.resolve(homeDirectory, ".dbt/profiles"),
  ]);
};

export async function readDbtProfile(
  filePath?: string
): Promise<Result<DbtProfile, Error>> {
  const dbtProfile = readFile(createProfilePaths(filePath));

  return dbtProfile
    .andThen((fileContents) => jinja.template(fileContents))
    .andThen(DbtProfile.fromFile);
}
