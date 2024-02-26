import { describe, test, expect } from "bun:test";
import { Redshift } from "./redshift";
import { assert } from "../utils";
import { ParseError } from "../errors";

describe(Redshift.name, () => {
  describe("given invalid config", () => {
    test("it should return an error", () => {
      const creds = Redshift.fromConfig({
        type: "redshift",
        host: "my-host",
        port: "my-port",
        user: "my-user",
        pass: "my-password",
        dbname: "my-database",
        schema: "my-schema",
        threads: "my-threads",
        sslmode: "my-sslmode",
      });

      assert(creds.isErr());

      expect(creds.error).toBeInstanceOf(ParseError);
    });
  });
  describe("given valid config", () => {
    test("it should return Redshift credentials", () => {
      const creds = Redshift.fromConfig({
        type: "redshift",
        host: "my-host",
        port: 5439,
        user: "my-user",
        password: "my-password",
        dbname: "my-database",
        schema: "my-schema",
        threads: 10,
        sslmode: "disable",
      });

      assert(creds.isOk());

      expect(creds.value).toEqual({
        type: "redshift",
        host: "my-host",
        port: 5439,
        user: "my-user",
        password: "my-password",
        dbname: "my-database",
        schema: "my-schema",
        threads: 10,
        sslmode: "disable",
      });
    })
  });
});
