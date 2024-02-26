import { describe, beforeAll, afterAll, test, expect } from "bun:test";
import { Manifest, UnsupportedManifestVersionError } from "./manifest";
import fs from "fs";
import { assert } from "../utils";

const VERSIONS = [
  ["v11", true],
  ["v10", true],
  ["v9", true],
  ["v8", true],
] as const;

describe(Manifest.name, () => {
  describe("fromFile", () => {
    VERSIONS.forEach(([version, supported]) => {
      beforeAll(async () => {
        await setup(version);
      });

      afterAll(() => {
        fs.rmSync(`./tmp/${version}.manifest.json`);
      });

      describe("given a valid manifest", () => {
        test(`it should return a Manifest`, async () => {
          const manifest = await Manifest.fromFile(
            `./tmp/${version}.manifest.json`
          );

          if (supported) {
            expect(manifest.isOk()).toBeTrue();
          } else {
            assert(manifest.isErr());

            expect(manifest.error).toBeInstanceOf(
              UnsupportedManifestVersionError
            );
          }
        });
      });

      if (supported) {
        describe("the models method", () => {
          test("it should return the models", async () => {
            const manifest = await Manifest.fromFile(
              `./tmp/${version}.manifest.json`
            );

            assert(manifest.isOk());

            const models = manifest.value.models();

            expect(models.every(x => x.resource_type === 'model')).toBeTrue();
          });
        });
      }
    });
  });
});

async function setup(version: string) {
  !fs.existsSync("./tmp") && fs.mkdirSync("./tmp", { recursive: true });
  const manifest = await import(`../../__tests__/${version}.manifest.json`);
  fs.writeFileSync(`./tmp/${version}.manifest.json`, JSON.stringify(manifest));
}
