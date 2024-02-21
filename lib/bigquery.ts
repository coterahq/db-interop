import { z } from "zod";
import { Result, err, ok } from 'neverthrow';
import { ParseError } from "./errors";
import fs from 'fs';

const bigQueryConfigSchema = z.object({
  type: z.literal('bigquery'), // Ensures the type is exactly 'bigquery'
  method: z.enum(['service-account', 'service-account-json']).optional(),
  project: z.string(),
  dataset: z.string(),
  keyfile: z.string().optional(), // Path to a JSON key file
  keyfile_json: z.record(z.any()).optional(), // Inline JSON credential
  timeout_seconds: z.number().optional(),
  retries: z.number().optional(),
});

const jsonCredentials = z.object({
  project_id: z.string(),
  private_key_id: z.string(),
  private_key: z.string(),
  client_email: z.string(),
  client_id: z.string(),
  auth_uri: z.string(),
  token_uri: z.string(),
  auth_provider_x509_cert_url: z.string(),
  client_x509_cert_url: z.string(),
})


export type BigQueryCredentials = z.infer<typeof bigQueryConfigSchema> & {
  credentials: z.infer<typeof jsonCredentials>
}

class KeyFileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class BigQuery {
  private constructor() {}

  static fromConfig(config: object): Result<BigQueryCredentials, KeyFileNotFoundError | ParseError> {
    const result = bigQueryConfigSchema.safeParse(config);

    if(!result.success) {
      return err(new ParseError(result.error.message));
    }

    if(result.data.keyfile) {
      //todo check if this is relative to the profiles.yaml file
      if(!fs.existsSync(result.data.keyfile)) {
        return err(new KeyFileNotFoundError(`No such file: ${result.data.keyfile}`));
      }

      const keyfile = jsonCredentials.safeParse(JSON.parse(fs.readFileSync(result.data.keyfile, 'utf8')));

      if(!keyfile.success) {
        return err(new ParseError(keyfile.error.message));
      }

      return ok({ ...result.data, credentials: keyfile.data });
    }

    const credentials = jsonCredentials.safeParse(result.data.keyfile_json);

    if(!credentials.success) {
      return err(new ParseError(credentials.error.message));
    }

    return ok({ ...result.data, credentials: credentials.data });
  }
}