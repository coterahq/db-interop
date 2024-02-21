import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { BigQuery, KeyFileNotFoundError } from './bigquery';
import fs from 'fs';
import { assert } from './utils';
import { ParseError } from './errors';

describe(BigQuery.name, () => {
  describe('given key file credentials', () => {
    describe('when file exists', () => {
      beforeAll(() => {
        fs.mkdirSync('./tmp', { recursive: true })
        fs.writeFileSync('./tmp/keyfile.json', JSON.stringify({
          project_id: 'my-project',
          private_key_id: 'my-private',
          private_key: 'my-key',
          client_email: 'my-email',
          client_id: 'my-id',
          auth_uri: 'my-uri',
          token_uri: 'my-uri',
          auth_provider_x509_cert_url: 'my-url',
          client_x509_cert_url: 'my-url',
         }))
      })

      afterAll(() => {
        fs.rmSync('./tmp/keyfile.json')
      })

      test("it should return a valid connection", () => {
        const bigquery = BigQuery.fromConfig({
          type: 'bigquery',
          method: 'service-account',
          project: 'my-project',
          dataset: 'my-dataset',
          keyfile: './tmp/keyfile.json',
          timeout_seconds: 10,
          retries: 3,
        })

        assert(bigquery.isOk())

        expect(bigquery.value).toEqual({
          type: 'bigquery',
          method: 'service-account',
          project: 'my-project',
          dataset: 'my-dataset',
          keyfile: './tmp/keyfile.json',
          timeout_seconds: 10,
          retries: 3,
          credentials: {
            project_id: 'my-project',
            private_key_id: 'my-private',
            private_key: 'my-key',
            client_email: 'my-email',
            client_id: 'my-id',
            auth_uri: 'my-uri',
            token_uri: 'my-uri',
            auth_provider_x509_cert_url: 'my-url',
            client_x509_cert_url: 'my-url',
          }
        })
      })
    })

    describe('when file does not exist', () => {
      test("it should return an error", () => {
        const bigquery = BigQuery.fromConfig({
          type: 'bigquery',
          method: 'service-account',
          project: 'my-project',
          dataset: 'my-dataset',
          keyfile: './tmp/keyfile.json',
          timeout_seconds: 10,
          retries: 3,
        })

        assert(bigquery.isErr())

        expect(bigquery.error).toBeInstanceOf(KeyFileNotFoundError);
      })
    })
  })
  
  describe('given inline json credentials', () => {
    test("it should return a valid connection", () => {
      const bigquery = BigQuery.fromConfig({
        type: 'bigquery',
        method: 'service-account-json',
        project: 'my-project',
        dataset: 'my-dataset',
        keyfile_json: {
          project_id: 'my-project',
          private_key_id: 'my-private',
          private_key: 'my-key',
          client_email: 'my-email',
          client_id: 'my-id',
          auth_uri: 'my-uri',
          token_uri: 'my-uri',
          auth_provider_x509_cert_url: 'my-url',
          client_x509_cert_url: 'my-url',
        },
        timeout_seconds: 10,
        retries: 3,
      })

      assert(bigquery.isOk())

      expect(bigquery.value).toEqual({
        type: 'bigquery',
        method: 'service-account-json',
        project: 'my-project',
        dataset: 'my-dataset',
        keyfile_json: {
          project_id: 'my-project',
          private_key_id: 'my-private',
          private_key: 'my-key',
          client_email: 'my-email',
          client_id: 'my-id',
          auth_uri: 'my-uri',
          token_uri: 'my-uri',
          auth_provider_x509_cert_url: 'my-url',
          client_x509_cert_url: 'my-url',
        },
        timeout_seconds: 10,
        retries: 3,
        credentials: {
          project_id: 'my-project',
          private_key_id: 'my-private',
          private_key: 'my-key',
          client_email: 'my-email',
          client_id: 'my-id',
          auth_uri: 'my-uri',
          token_uri: 'my-uri',
          auth_provider_x509_cert_url: 'my-url',
          client_x509_cert_url: 'my-url',
        }
      })
    })
  })

  describe('given invalid config', () => {
    test("it should return an error", () => {
      const bigquery = BigQuery.fromConfig({
        type: 'bigquery',
        method: 'service-account',
        project: 'my-project',
        dataset: 'my-dataset',
        timeout_seconds: 10,
        retries: 3,
      })

      assert(bigquery.isErr())

      expect(bigquery.error).toBeInstanceOf(ParseError);
    })
  })
})