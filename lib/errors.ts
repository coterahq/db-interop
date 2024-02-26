import type { ZodError } from "zod";

export class ParseError extends Error {
  constructor(message: string | ZodError) {
    super(JSON.stringify(message, null, 2));
  }
}

export class NoSuchFileError extends Error {
  constructor(message: string) {
    super(message);
  }
}


export class TargetNotFoundError extends Error {
  constructor(name: string) {
    super(`Target not found: ${name}`);
  }
}

export class ProfileNotFoundError extends Error {
  constructor(name: string) {
    super(`Profile not found: ${name}`);
  }
}

export class DatabaseNotSupportedError extends Error {
  constructor(type: string) {
    super(`Database not supported: ${type}`);
  }
}