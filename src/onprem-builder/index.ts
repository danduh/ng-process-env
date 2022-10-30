import { BuilderContext, BuilderOutput, createBuilder } from "@angular-devkit/architect";
import { JsonObject } from "@angular-devkit/core";
import * as ts from "typescript";
import {
  OptionalKind,
  Project,
  PropertyAssignment,
  PropertyAssignmentStructure,
  ScriptTarget,
} from "ts-morph";
import {
  getAnyValueFromProcess,
  getBooleanFromProcess,
  getNumberFromProcess,
  getStringFromProcess,
  NO_ENV_VAR_OR_VALUE_IN_PROCESS
} from "../utils/ast";

interface Options extends JsonObject {
  environmentFile: string;
}

export default createBuilder<Options>(
  async (options: Options, context: BuilderContext): Promise<BuilderOutput> => {

    context.reportStatus(`Executing my command "${ options.environmentFile }"...`);
    const project = new Project({
      compilerOptions: {target: ScriptTarget.Latest}
    });

    const sourceFile = project.addSourceFileAtPath("./" + options.environmentFile);
    // get the object literal
    const additionalDataProp = sourceFile
      .getVariableDeclarationOrThrow("environment")
      .getInitializerIfKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression)
      .getPropertyOrThrow("envVar") as PropertyAssignment;
    const additionalDataObjLit = additionalDataProp
      .getInitializerIfKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression);


    const LOST_OF_VARS: OptionalKind<PropertyAssignmentStructure>[] = [];

    additionalDataObjLit.getProperties()
      .forEach(c => {
        const propName = c.getSymbol()?.getName() as string;

        let toUpdate = false;
        if (c.getType().isBoolean()) {

          const _var = getBooleanFromProcess(propName);
          if (_var !== NO_ENV_VAR_OR_VALUE_IN_PROCESS) {
            toUpdate = true;
            LOST_OF_VARS.push(_var as OptionalKind<PropertyAssignmentStructure>);
          }
        } else if (c.getType().isNumber()) {

          const _var = getNumberFromProcess(propName);
          if (_var !== NO_ENV_VAR_OR_VALUE_IN_PROCESS) {
            toUpdate = true;
            LOST_OF_VARS.push(_var as OptionalKind<PropertyAssignmentStructure>);
          }
        } else if (c.getType().isString()) {

          const _var = getStringFromProcess(propName);
          if (_var !== NO_ENV_VAR_OR_VALUE_IN_PROCESS) {
            toUpdate = true;
            LOST_OF_VARS.push(_var as OptionalKind<PropertyAssignmentStructure>);
          }
        } else if (c.getType().isNull() || c.getType().isUndefined()) {

          const _var = getAnyValueFromProcess(propName);
          if (_var !== NO_ENV_VAR_OR_VALUE_IN_PROCESS) {
            toUpdate = true;
            LOST_OF_VARS.push(_var as OptionalKind<PropertyAssignmentStructure>);
          }
        }

        if (toUpdate) {
          c.remove();
        }

      });

    if (LOST_OF_VARS.length > 0) {
      additionalDataObjLit.addPropertyAssignments(LOST_OF_VARS)
    }

    sourceFile.saveSync();
    return {success: true};

  });
