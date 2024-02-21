import fs from 'fs';
import { NoSuchFileError } from './errors';
import { Result, err, ok } from 'neverthrow';
export function assert(cond: boolean, msg?: string): asserts cond {
  if (!cond) {
    const error = new Error(msg ?? 'Assertation Error');
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(error, assert);
    }
    throw error;
  }
}

/**
 * 
 * @param file names without the file type on the end
 * @returns array of file names with the various file type possibilities on the end
 */
export const createPathOptions = (files: (string | undefined)[]): string[] => {
  const variations = ["yml", "yaml"];

  return files.filter((file) => file !== undefined)
    .map((path) => variations.map((variation) => `${path}.${variation}`))
    .flat();
};

export const readFile = (possibleFileLocations: string[]): Result<string, NoSuchFileError> => {
  let dbtFile: string | null = null;
  for (const filePath of possibleFileLocations) {
    if (fs.existsSync(filePath)) {
      dbtFile = filePath;
      break;
    }
  }

  if (dbtFile === null) {
    return err(new NoSuchFileError(`No such file: ${dbtFile}`));
  }

  return ok(fs.readFileSync(dbtFile, "utf8"));
}