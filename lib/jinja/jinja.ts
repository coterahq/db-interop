import { err, ok, type Result } from "neverthrow";

type FunctionImplementation = (...args: string[]) => string;

class FunctionImlpementationNotFoundError extends Error {
  constructor(name: string) {
    super(`Function ${name} not registered.`);
  }
}

export class Jinja {
  private functions: Record<string, FunctionImplementation> = {};

  constructor() {}

  register(functionName: string, implementation: FunctionImplementation): Jinja {
    this.functions[functionName] = implementation;
    return this; // Allow chaining
  }

  template(input: string): Result<string, Error> {
    try {
      const regex = /{{\s*([^}]+)\s*}}/g;
      const result = input.replace(regex, (_match, expression: string) => {
        const parts = expression.split('|').map(part => part.trim());

        let currentResult: string = '';
        let isFirstPart = true;

        for (let part of parts) {
          let functionName: string;
          let args: string[];

          if (isFirstPart) {
            let directValueMatch = part.match(/^['"](.*)['"]$/);
            if (directValueMatch) {
              // Handle direct value as initial input
              currentResult = directValueMatch[1];
              isFirstPart = false;
              continue;
            }
          }

          // Extract function name and arguments
          let functionMatch = part.match(/^([a-zA-Z0-9_]+)\((.*?)\)$/);

          if (functionMatch) {
            // Function with arguments
            functionName = functionMatch[1];
            args = functionMatch[2].split(',')
              .map(arg => arg.trim().replace(/^['"](.*)['"]$/, '$1')); // Strip both types of quotes
            if(!isFirstPart) {
              args.unshift(currentResult);
            }
          } else {
            // Function without arguments, using previous result as single argument
            functionName = part;
            args = isFirstPart ? [] : [currentResult];
          }

          const implementation = this.functions[functionName];
          if (!implementation) {
            throw new FunctionImlpementationNotFoundError(functionName);
          }

          currentResult = implementation(...args);
          isFirstPart = false;
        }

        return currentResult;
      });

      return ok(result);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}