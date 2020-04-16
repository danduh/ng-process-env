import {
  chain, noop, Rule,
  schematic,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { NgAddOptions } from "./schemas";

export default function (ngAddOptions: NgAddOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if(!ngAddOptions.project){
      return noop();
    }

    return chain(
      [
        schematic('onprem-env', ngAddOptions)
      ]
    )(host, context);
  };
}
