import { Result, err, ok } from "neverthrow";
import { createPathOptions, readFile } from "./utils";
import path from "path";
import yaml from "yaml";
import { z } from "zod";
import { NoSuchFileError, ParseError } from "./errors";
import { readDbtProfile } from "./read-profile";
import type { Credentials } from "./types";

const projectSchema = z.object({
  profile: z.string(),
});

class DbtProject {
  constructor(readonly config: z.infer<typeof projectSchema>) {}

  async loadCredentials(filePath?: string, target?: string): Promise<Result<Credentials, Error>> {
    return (await readDbtProfile(filePath)).andThen((profile) => profile.credentials(this.config.profile, target));
  }
}

export async function readDbtProject(
  filePath?: string,
): Promise<Result<DbtProject, ParseError | NoSuchFileError>> {
  const paths = createPathOptions([
    filePath,
    path.join(__dirname, "dbt_project"),
  ]);

  return readFile(paths).andThen((fileContents) => {
    const result = projectSchema.safeParse(yaml.parse(fileContents));

    if (!result.success) {
      return err(new ParseError(result.error.message));
    }

    return ok(new DbtProject(result.data));
  });
}
