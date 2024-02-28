import { ok, type Result, err } from "neverthrow";
import { ParseError } from "../errors";
import { BaseManifestSchema } from "./manifest.schema.base";
import type { z } from "zod";
import { v11NodesSchema, type V11ModelNode } from "./manifest.schema.v11";
import { readFile } from "../utils";
import path from "path";

export class UnsupportedManifestVersionError extends Error {
  constructor(version: string) {
    super(`Unsupported manifest version: ${version}`);
  }
}

export class DbtManifest {
  static fromConfig(
    object: any
  ): Result<ManifestV11, ParseError | UnsupportedManifestVersionError> {
    const parsed = BaseManifestSchema.safeParse(object);

    if (!parsed.success) {
      return err(new ParseError(parsed.error));
    }

    switch (parsed.data.metadata.dbt_schema_version) {
      case "https://schemas.getdbt.com/dbt/manifest/v11.json":
      case "https://schemas.getdbt.com/dbt/manifest/v10.json":
      case "https://schemas.getdbt.com/dbt/manifest/v9.json":
      case "https://schemas.getdbt.com/dbt/manifest/v8.json":
        return ManifestV11.fromNodes(parsed.data.nodes);
      default:
        return err(
          new UnsupportedManifestVersionError(
            parsed.data.metadata.dbt_schema_version
          )
        );
    }
  }

  static async fromFile(
    filePath?: string
  ): Promise<
    Result<ManifestV11, ParseError | UnsupportedManifestVersionError>
  > {
    const options = [
      filePath,
      path.join(process.cwd(), "manifest.json"),
      path.join(process.cwd(), "target", "manifest.json"),
    ].filter((t) => t !== undefined) as string[];

    return readFile(options).andThen((fileContents) => {
      return DbtManifest.fromConfig(JSON.parse(fileContents));
    });
  }
}

export type SupportedDbtManifest = ManifestV11;

export class ManifestV11 {
  private constructor(readonly nodes: z.infer<typeof v11NodesSchema>) {}

  static fromNodes(object: any): Result<ManifestV11, ParseError> {
    const parsed = v11NodesSchema.safeParse(object);

    if (!parsed.success) {
      return err(new ParseError(parsed.error));
    }

    return ok(new ManifestV11(parsed.data));
  }

  models(): V11ModelNode[] {
    return Object.values(this.nodes).filter(
      (node) => node.resource_type === "model"
    ) as V11ModelNode[];
  }
}
