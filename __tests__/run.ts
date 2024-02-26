import type { Result } from "neverthrow";
import { readDbtProject, readDbtProfiles } from "../lib";
import type { Credentials } from "../lib/types";
import { assert } from "../lib/utils";

const project = await readDbtProject()

let creds: Result<Credentials, Error>

if(project.isOk()) { //could be a parse error or no such file error
  creds = await project.value.loadCredentials()
}
else {
  const dbtProfile = await readDbtProfiles();

  assert(dbtProfile.isOk())

  const first = dbtProfile.value.list().at(0)!
  
  creds = dbtProfile.value.profile(first).andThen((profile) => profile.credentials())
}

console.log(creds.isOk() ? creds.value : creds.error.message)
