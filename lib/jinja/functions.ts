export const toUpper = (str: string) => str.toUpperCase();

export const toLower = (str: string) => str.toLowerCase();

export const envVar = (name: string) => process.env[name] || "";