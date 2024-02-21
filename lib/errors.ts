
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class NoSuchFileError extends Error {
  constructor(message: string) {
    super(message);
  }
}
