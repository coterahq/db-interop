import type { Result } from "neverthrow";
import { readDbtProfile } from "../lib/read-profile";
import { readDbtProject } from "../lib/read-project";
import type { Credentials } from "../lib/types";
import { assert } from "../lib/utils";

// const project = await readDbtProject()

// let creds: Result<Credentials, Error>

// if(project.isOk()) { //could be a parse error or no such file error
//   creds = await project.value.loadCredentials()
// }
// else {
//   const dbtProfile = await readDbtProfile();

//   assert(dbtProfile.isOk())

//   const first = dbtProfile.value.list().at(0)!
  
//   creds = dbtProfile.value.credentials(first)
// }

// console.log(creds.isOk() ? creds.value : creds.error.message)
