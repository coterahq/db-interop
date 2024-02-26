import { Result, err, ok } from "neverthrow";
import { createPathOptions, readFile } from "../utils";
import path from "path";
import yaml from "yaml";
import { z } from "zod";
import { NoSuchFileError, ParseError } from "../errors";
import type { Credentials } from "../types";
import { readDbtProfiles } from "../profile";
import { Manifest } from "../manifest";

const projectSchema = z.object({
  profile: z.string(),
});

export class DbtProject {
  constructor(readonly config: z.infer<typeof projectSchema>) {}

  static fromFile(filePath?: string) {
    return readDbtProject(filePath);
  }

  async loadCredentials(
    filePath?: string,
    target?: string
  ): Promise<Result<Credentials, Error>> {
    return (await readDbtProfiles(filePath))
      .andThen((profile) => profile.profile(this.config.profile))
      .andThen((profile) => profile.credentials(target));
  }

  async loadManifest(filePath?: string) {
    return Manifest.fromFile(filePath);
  }
}

export async function readDbtProject(
  filePath?: string
): Promise<Result<DbtProject, ParseError | NoSuchFileError>> {
  const paths = createPathOptions(
    filePath ? [filePath] : [path.join(process.cwd(), "dbt_project")]
  );

  return readFile(paths).andThen((fileContents) => {
    const result = projectSchema.safeParse(yaml.parse(fileContents));

    if (!result.success) {
      return err(new ParseError(result.error.message));
    }

    return ok(new DbtProject(result.data));
  });
}
