import { describe, test, expect } from 'bun:test';
import { DbtProfile, SUPPORTED_DATABASES } from './dbt-profile';
import { assert } from '../utils';
import { DatabaseNotSupportedError, ParseError, ProfileNotFoundError, TargetNotFoundError } from '../errors';

const examleProfile = `
  snowflake:
    target: my-target
    outputs:
      my-target:
        type: snowflake
        account: my-account
        user: my-user
        port: 443
        schema: my-schema
        password: my-password
        role: my-role
        warehouse: my-warehouse
        database: my-database
  redshift:
    target: dev
    outputs:
      dev:
        type: redshift
        host: my-host
        port: 5439
        user: my-user
        password: my-password
        dbname: my-database
        schema: my-schema
  bigquery:
    target: dev
    outputs:
      dev:
        type: bigquery
        method: service-account
        project: my-project
        dataset: my-dataset
        timeout_seconds: 10
        retries: 3
        keyfile_json: 
          project_id: my-project
          private_key_id: my-private
          private_key: my-key
          client_email: my-email
          client_id: my-id
          auth_uri: my-uri
          token_uri: my-uri
          auth_provider_x509_cert_url: my-url
          client_x509_cert_url: my-url
  postgres:
    target: dev
    outputs:
      dev:
        type: postgres
        host: my-host
        port: 5439
        user: my-user
        password: my-password
        dbname: my-database
        schema: my-schema
  unsupported-db:
    target: dev
    outputs:
      dev:
        type: mariadb
`;

describe(DbtProfile.name, () => {
  describe('given invalid config', () => {
    test("it should return an error", () => {
      const dbtProfile = DbtProfile.fromYamlString("invalid: config");
      
      assert(dbtProfile.isErr())

      expect(dbtProfile.error).toBeInstanceOf(ParseError);
    });
  })

  describe('given valid config', () => {
    test("it should return a DbtProfile", () => {
      const dbtProfile = DbtProfile.fromYamlString(examleProfile);
      
      assert(dbtProfile.isOk())

      expect(dbtProfile.value).toBeInstanceOf(DbtProfile);
    })
  })

  describe('the credentials method', () => {
    describe('given profile does not exist', () => {
      test("it should return an error", () => {
        const dbtProfile = DbtProfile.fromYamlString(examleProfile);
        
        assert(dbtProfile.isOk())

        const credentials = dbtProfile.value.credentials("invalid-profile");
        
        assert(credentials.isErr())

        expect(credentials.error).toBeInstanceOf(ProfileNotFoundError);
        expect(credentials.error.message).toBe("Profile not found: invalid-profile");
      })
    })

    describe('given target does not exist', () => {
      test("it should return an error", () => {
        const dbtProfile = DbtProfile.fromYamlString(examleProfile);
        
        assert(dbtProfile.isOk())

        const credentials = dbtProfile.value.credentials("snowflake", "invalid-target");
        
        assert(credentials.isErr())

        expect(credentials.error).toBeInstanceOf(TargetNotFoundError);
        expect(credentials.error.message).toBe("Target not found: invalid-target");
      })
    })

    describe('given unsupported database', () => {
      test("it should return an error", () => {
        const dbtProfile = DbtProfile.fromYamlString(examleProfile);
        
        assert(dbtProfile.isOk())

        const credentials = dbtProfile.value.credentials("unsupported-db");
        
        assert(credentials.isErr())

        expect(credentials.error).toBeInstanceOf(DatabaseNotSupportedError);
        expect(credentials.error.message).toBe("Database not supported: mariadb");
      })
    })

    describe('given valid profile and target', () => {
      for(const dbType of SUPPORTED_DATABASES) {
        test(`it should return a ${dbType} instance`, () => {
          const dbtProfile = DbtProfile.fromYamlString(examleProfile);
          
          assert(dbtProfile.isOk())

          const credentials = dbtProfile.value.credentials(dbType);
          
          assert(credentials.isOk())

          expect(credentials.value.type).toEqual(dbType);
        })
      }
    })
  })

  describe('the list method', () => {
    test("it should return a list of profiles", () => {
      const dbtProfile = DbtProfile.fromYamlString(examleProfile);
      
      assert(dbtProfile.isOk())

      const list = dbtProfile.value.list();
      
      expect(list).toEqual(["snowflake", "redshift", "bigquery", "postgres", "unsupported-db"]);
    })
  })
})