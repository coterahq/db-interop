import { z } from "zod"

const ManifestMetadata = z.object({
  dbt_schema_version: z.string(),
  dbt_version: z.string(),
  generated_at: z.coerce.date().optional(),
  env: z.record(z.string()).optional(),
  project_name: z.string().optional(),
  project_id: z.string().optional(),
  user_id: z.string().optional(),
  adapter_type: z.any().optional(),
})


export const BaseManifestSchema = z.object({
  metadata: ManifestMetadata,
  nodes: z.record(z.any()),
})
