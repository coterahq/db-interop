import { envVar, toLower, toUpper } from "./functions";
import { Jinja } from "./jinja";

export const jinja = new Jinja()
  .register('to_upper', toUpper)
  .register('to_lower', toLower)
  .register('env_var', envVar);