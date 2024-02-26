import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { DbtProject } from "./project";
import { assert } from "../utils";
import fs from "fs";
import path from "path";
import { NoSuchFileError, ParseError } from "../errors";

describe(DbtProject.name, () => {
  describe("given file does not exist", () => {
    test("it should return an error", async () => {
      const project = await DbtProject.fromFile("doesnt_exist");

      assert(project.isErr());

      expect(project.error).toBeInstanceOf(NoSuchFileError);
    });
  });

  describe("given invalid config", () => {
    beforeAll(() => {
      fs.writeFileSync(
        path.join(process.cwd(), "invalid.yml"),
        ` 
      name: my_project
      `
      );
    });

    afterAll(() => {
      fs.rmSync(path.join(process.cwd(), "invalid.yml"));
    });

    test("it should return an error", async () => {
      const project = await DbtProject.fromFile(
        path.join(process.cwd(), "invalid.yml")
      );

      assert(project.isErr());

      expect(project.error).toBeInstanceOf(ParseError);
    });
  });

  describe("given valid config", () => {
    beforeAll(() => {
      fs.writeFileSync(
        path.join(process.cwd(), "dbt_project.yml"),
        ` 
      name: my_project
      version: 1.0
      source-paths: ["models"]
      profile: my-profile
      `
      );
    });

    afterAll(() => {
      fs.rmSync(path.join(process.cwd(), "dbt_project.yml"));
    });

    test("it should return a DbtProject", async () => {
      const project = await DbtProject.fromFile();

      assert(project.isOk());

      expect(project.value).toBeInstanceOf(DbtProject);
    });
  });
});
