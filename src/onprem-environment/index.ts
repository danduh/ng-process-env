import {
    apply,
    mergeWith,
    move,
    Rule,
    SchematicContext,
    Source, template,
    Tree,
    url
} from "@angular-devkit/schematics";
import { OnPremOptions } from "./schema";
import { normalize } from "@angular-devkit/core";
import { EnvProcessor } from "./processor";
// import * as fs from "fs";
import * as ts from "typescript";
import { getDefaultEnvironmentCode, getSourceNodes } from "../utils/ast";
import { MergeStrategy } from "@angular-devkit/schematics/src/tree/interface";


/**
 * Should create
 * @param _options
 */
export function onpremEnvironment(_options: OnPremOptions): Rule{
    return (tree: Tree, _context: SchematicContext) => {
        // @ts-ignore
        let envsPath: string = "";
        _options.config = _options.config || "onprem";

        const processor = new EnvProcessor(_options);

        _context.logger.info(`Project ${ _options.project } will be updated`);
        if (tree.exists("angular.json")) {
            const angularStr = tree.read("angular.json")!.toString("utf-8");
            let angular = JSON.parse(angularStr);
            const projs = (Object.keys(angular["projects"]));

            if (!angular["projects"].hasOwnProperty(_options.project)) {
                _context.logger.error(`We can't find project ${ _options.project } in your angular.json [${ projs }]`);
                process.exit(2)
            }

            envsPath = processor.lookForBaseJsonPathInNG(angular);
            if (!envsPath) {
                _context.logger.error(`We not able to find the location of your \n
         environment.ts files. Project: ${ _options.project } in your angular.json [${ projs }] \n
         run command with --path property`);
                process.exit(2)
            }

            _context.logger.warn("Env File will be created at " + envsPath);

            angular = processor.addFileReplacement(angular, envsPath);

            tree.overwrite("angular.json", JSON.stringify(angular, null, "\t"));
        } else {
            console.error("can't find angular.json file", normalize(__dirname + "angular.json"))

        }

        let sourceText = tree.read(envsPath + "/environment.ts")!.toString("utf-8");

        let sourceFile = ts.createSourceFile(envsPath + "/environment.ts", sourceText, ts.ScriptTarget.Latest, true);
        let nodes: ts.Node[] = getSourceNodes(sourceFile);

        const baseEnvironmentVars = getDefaultEnvironmentCode(nodes);
        _context.logger.info("Original environment \n" + baseEnvironmentVars.getText());
        _options.path = normalize(envsPath + `/environment.${ _options.config }.ts`);

        const source: Source = url("./template");
        const transformedSource: Source = apply(source,
            [
                template({
                    ..._options,
                    environmentFilesMerger: () => baseEnvironmentVars.getText()
                }),
                move(normalize(envsPath))
            ]);
        return  mergeWith(transformedSource, MergeStrategy.Overwrite)(tree, _context);
    };
}
