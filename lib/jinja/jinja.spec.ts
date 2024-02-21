import { Jinja } from "./jinja";
import { expect, test, describe } from "bun:test";
import { assert } from '../utils';

describe(Jinja.name, () => {
  describe('given valid function', () => {
    test("it should run the registered function", () => {
      const jinja = new Jinja()
        .register("to_upper", (str: string) => str.toUpperCase())
  
      const result = jinja.template("{{ 'hello' | to_upper }}");
      
      assert(result.isOk())
  
      expect(result.value).toBe("HELLO");
    });
  })

  describe('given invalid function', () => {
    test("it should return an error", () => {
      const jinja = new Jinja()
  
      const result = jinja.template("{{ 'hello' | to_upper }}");
      
      assert(result.isErr())
  
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Function to_upper not registered.");
    });
  })

  describe('given a function with arguments', () => {
    test("it should run the registered function with arguments", () => {
      const jinja = new Jinja()
        .register("repeat", (str: string, times: string) => str.repeat(parseInt(times)))
  
      const result = jinja.template("{{ 'hello' | repeat(3) }}");
      
      assert(result.isOk())
  
      expect(result.value).toBe("hellohellohello");
    });
  })

  describe('given a function with arguments and spaces', () => {
    test("it should run the registered function with arguments", () => {
      const jinja = new Jinja()
        .register("repeat", (str: string, times: string) => str.repeat(parseInt(times)))
  
      const result = jinja.template("{{ 'hello' | repeat( 3 ) }}");
      
      assert(result.isOk())
  
      expect(result.value).toBe("hellohellohello");
    });
  })

  describe('given chained functions', () => {
    test("it should run the registered functions in order", () => {
      const jinja = new Jinja()
        .register("to_upper", (str: string) => str.toUpperCase())
        .register("repeat", (str: string, times: string) => str.repeat(parseInt(times)))
  
      const result = jinja.template("{{ 'hello' | to_upper | repeat(3) }}");
      
      assert(result.isOk())
  
      expect(result.value).toBe("HELLOHELLOHELLO");
    });
  })

  describe('given direct function call', () => {
    test("it should run the registered function", () => {
      const jinja = new Jinja()
        .register("to_upper", (str: string) => str.toUpperCase())
  
      const result = jinja.template("{{ to_upper('hello') }}");
      
      assert(result.isOk())
  
      expect(result.value).toBe("HELLO");
    });
  })

  describe('given direct function call', () => {
    test("it should run the registered function", () => {
      const jinja = new Jinja()
        .register("to_upper", (str: string) => str.toUpperCase())
        .register("to_lower", (str: string) => str.toLowerCase())
  
      const result = jinja.template("{{ to_upper('hello') | to_lower }}");
      
      assert(result.isOk())

      expect(result.value).toBe("hello");
    });
  })

  describe('given direct function call with double quotes', () => {
    test("it should run the registered function", () => {
      const jinja = new Jinja()
        .register("to_upper", (str: string) => str.toUpperCase())
  
      const result = jinja.template(`{{ to_upper("hello") }}`);
      
      assert(result.isOk())
  
      expect(result.value).toBe("HELLO");
    });
  })

  describe('given chained function with string arguments', () => {
    test("it should run the registered function", () => {
      const jinja = new Jinja()
        .register("to_upper", (str: string) => str.toUpperCase())
        .register("concat", (str: string, suffix: string) => `${str}${suffix}`)
  
      const result = jinja.template(`{{ to_upper("hello") | concat(' world') }}`);
      
      assert(result.isOk())
  
      expect(result.value).toBe("HELLO world");
    });
  })

  describe('given invalid template', () => {
    test("it should not template", () => {
      const jinja = new Jinja()
        .register("to_upper", (str: string) => str.toUpperCase())
        .register("concat", (str: string, suffix: string) => `${str}${suffix}`)
  
      const result = jinja.template(`{% to_upper("hello") | concat(' world') %}`);
      
      assert(result.isOk())
  
      expect(result.value).toBe("{% to_upper(\"hello\") | concat(' world') %}");
    });
  })
})