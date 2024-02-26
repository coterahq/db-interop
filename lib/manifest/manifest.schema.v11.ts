import { z } from "zod";

const ColumnInfo = z.object({
  name: z.string(),
  description: z.string().default(""),
  meta: z.record(z.string()),
  data_type: z.union([z.string(), z.null()]).default(null),
  constraints: z.array(
    z.object({
      type: z.enum([
        "check",
        "not_null",
        "unique",
        "primary_key",
        "foreign_key",
        "custom",
      ]),
      name: z.union([z.string(), z.null()]).default(null),
    })
  ),
  quote: z.union([z.boolean(), z.null()]).default(null),
  tags: z.array(z.string()),
});

const ModelConfig = z.object({
  enabled: z.boolean().default(true),
  alias: z.union([z.string(), z.null()]).default(null),
  schema: z.union([z.string(), z.null()]).default(null),
  database: z.union([z.string(), z.null()]).default(null),
  tags: z.union([z.array(z.string()), z.string()]),
  meta: z.record(z.string()),
  group: z.union([z.string(), z.null()]).default(null),
  materialized: z.string().default("view"),
  incremental_strategy: z.union([z.string(), z.null()]).default(null),
  persist_docs: z.record(z.string()),
  quoting: z.record(z.string()),
  column_types: z.record(z.string()),
  full_refresh: z.union([z.boolean(), z.null()]).default(null),
  unique_key: z
    .union([z.string(), z.array(z.string()), z.null()])
    .default(null),
  packages: z.array(z.string()),
  docs: z.object({
    show: z.boolean().default(true),
  }),
  contract: z.object({
    enforced: z.boolean().default(false),
    alias_types: z.boolean().default(true),
  }),
  access: z.enum(["private", "protected", "public"]).default("protected"),
});

const v11ModelNode = z.object({
  database: z.union([z.string(), z.null()]),
  schema: z.string(),
  name: z.string(),
  resource_type: z.string(),
  package_name: z.string(),
  path: z.string(),
  original_file_path: z.string(),
  unique_id: z.string(),
  alias: z.string(),
  config: ModelConfig,
  tags: z.array(z.string()),
  description: z.string().default(""),
  columns: z.record(ColumnInfo),
  meta: z.record(z.string()),
  docs: z.object({
    show: z.boolean().default(true),
    node_color: z.union([z.string(), z.null()]).default(null),
  }),
  relation_name: z.union([z.string(), z.null()]).default(null),
  language: z.string().default("sql"),
});

export type V11ModelNode = z.infer<typeof v11ModelNode>;

const otherResourcesType = z.object({
  resource_type: z.string(),
});

export const v11NodesSchema = z
  .record(
    v11ModelNode.or(otherResourcesType)
  )
  .describe("The nodes defined in the dbt project and its dependencies");
