import { describe, test, expect } from 'bun:test';
import { createPathOptions } from './utils';

describe(createPathOptions.name, () => {
  describe('given a path without an extension', () => {
    test('it should return the yaml path options', () => {
      const options = createPathOptions(['path']);

      expect(options).toEqual(['path.yml', 'path.yaml']);
    });
  });


  describe('given a path a . in the folder path', () => {
    test('it should return the yaml path options', () => {
      const options = createPathOptions(['.dbt/path']);

      expect(options).toEqual(['.dbt/path.yml', '.dbt/path.yaml']);
    });
  });

  describe('given a path with an extension', () => {
    test('it should return the path', () => {
      const options = createPathOptions(['path.yml']);

      expect(options).toEqual(['path.yml']);
    });
  });
})