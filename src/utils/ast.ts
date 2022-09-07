import * as ts from "typescript";
import { OptionalKind, PropertyAssignmentStructure, Writers } from "ts-morph";

export const NO_ENV_VAR_OR_VALUE_IN_PROCESS = "Property not part of the environment";

export function getSourceNodes(sourceFile: ts.SourceFile): ts.Node[]{
    const nodes: ts.Node[] = [ sourceFile ];
    const result = [];

    while (nodes.length > 0) {
        const node = nodes.shift();

        if (node) {
            result.push(node);
            if (node.getChildCount(sourceFile) >= 0) {
                nodes.unshift(...node.getChildren());
            }
        }
    }

    return result;
}

/**
 * returns the node (JSON)
 * export const environment =
 * {
 *   production:false,
 *   otherProperty: value
 * }
 * @param nodes source of default environment.ts file
 */
export function getDefaultEnvironmentCode(nodes: ts.Node[]): ts.Node{
    const routeNodes = nodes
        .filter((n: ts.Node) => {

            if (n.kind === ts.SyntaxKind.VariableDeclaration) {

                const index = n.getChildren().findIndex(c => {

                    return (c.kind === ts.SyntaxKind.Identifier && c.getText() === "environment");
                });
                if (index !== -1) {
                    return true;
                }
            }
            return false;
        })
        .map((n: ts.Node) => {
            const arrNodes = n
                .getChildren()
                .filter(c => (c.kind == ts.SyntaxKind.ObjectLiteralExpression))

            return arrNodes[arrNodes.length - 1];
        })
        .map((n: ts.Node) => {
            const arrNodes = n
                .getChildren()
                .filter((n: ts.Node) => {
                    return n.kind === ts.SyntaxKind.SyntaxList
                });

            return arrNodes[arrNodes.length - 1];
        });
    return routeNodes[0];
}

/***
 * affects only on
 * "0", "1", "true" ,"false", "True", "False"
 * @param propName
 */
export function getBooleanFromProcess(propName: string): OptionalKind<PropertyAssignmentStructure> | string{
    let envValue = "";

    if (!process.env.hasOwnProperty(propName) ||
        process.env[propName] === undefined) {
        return NO_ENV_VAR_OR_VALUE_IN_PROCESS;
    }

    const processValue = process.env[propName]?.toLocaleLowerCase();

    if (processValue === "0" || processValue === "false") {
        envValue = "false";
    } else if (processValue === "1" || processValue === "true") {
        envValue = "true";
    }

    if (envValue.length === 0) {
        return NO_ENV_VAR_OR_VALUE_IN_PROCESS;
    }

    return {
        name: propName,
        initializer: (writer) => {
            Writers.assertion(envValue, "boolean")(writer)
        },
    }
}


export function getNumberFromProcess(propName: string): OptionalKind<PropertyAssignmentStructure> | string{
    let envValue = 0;

    if (!process.env.hasOwnProperty(propName) ||
        process.env[propName] === undefined ||
        isNaN(process.env[propName] as unknown as number)) {
        return NO_ENV_VAR_OR_VALUE_IN_PROCESS;
    }

    envValue = parseInt(process.env[propName] as string, 10);

    return {
        name: propName,
        initializer: (writer) => {
            Writers.assertion(envValue, "number")(writer)
        },
    }
}

export function getStringFromProcess(propName: string): OptionalKind<PropertyAssignmentStructure> | string{
    let envValue = "";

    if (!process.env.hasOwnProperty(propName) || process.env[propName] === undefined) {
        return NO_ENV_VAR_OR_VALUE_IN_PROCESS;
    }

    envValue = process.env[propName] as string;
    return {
        name: propName,
        initializer: (writer) => {
            writer.quote(envValue)
        },
    }
}

export function getAnyValueFromProcess(propName: string): OptionalKind<PropertyAssignmentStructure> | string{

    if (!process.env.hasOwnProperty(propName)) {
        return NO_ENV_VAR_OR_VALUE_IN_PROCESS;
    }
    return {
        name: propName,
        initializer: (writer) => {
            writer.quote(process.env[propName] as string)
        },
    }
}
