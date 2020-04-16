import {
  apply,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Source, template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { OnPremOptions } from "./schema";
import { normalize } from "@angular-devkit/core";
// import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { EnvProcessor } from "./processor";
import * as fs from "fs";
import * as ts from "typescript";
// import { environmentFilesMerger } from "./environment-files.merger";
import { getDefaultEnvironmentCode, getSourceNodes } from "../utils/ast";

const BUILDER_TARGET = {
  "builder": "ngx-onprem-builder:collectVars",
  "options": {
    "environmentFile": ""
  }
};

const BUILDER_COMMAND = 'collect-vars';

/**
 * Should create
 * @param _options
 */
export function onpremEnvironment(_options: OnPremOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // @ts-ignore
    const processor = new EnvProcessor(_options, _context);

    let envsPath: string = '';

    _options.config = _options.config || 'onprem';

    const fileReplace = (path: string) => {
      return {
        "replace": `${path}/environment.ts`,
        "with": `${path}/environment.${_options.config}.ts`,
      }
    };

    _context.logger.info(`Project ${_options.project} will be updated`);
    _context.logger.warn('Warn message');
    _context.logger.error('Error message');


    if (tree.exists('angular.json')) {

      const angularStr = tree.read('angular.json')!.toString('utf-8');
      const angular = JSON.parse(angularStr);
      const projs = (Object.keys(angular['projects']));

      if (!angular['projects'].hasOwnProperty(_options.project)) {
        _context.logger.error(`We can't find project ${_options.project} in your angular.json [${projs}]`);
        process.exit(2)
      }

      envsPath = processor.lookForBaseJsonPathInNG(angular);
      _context.logger.warn('Env File will be created at ' + envsPath);

      BUILDER_TARGET.options.environmentFile = `${envsPath}/environment.${_options.config}.ts`;
      angular['projects'][_options.project]['architect'][BUILDER_COMMAND] = BUILDER_TARGET;

      if (angular['projects'][_options.project]['architect']['build'].configurations.hasOwnProperty(_options.config)) {

        if (angular['projects'][_options.project]['architect']['build'].configurations[_options.config].hasOwnProperty('fileReplacements'))
          angular['projects'][_options.project]['architect']['build'].configurations[_options.config]['fileReplacements'].push(fileReplace(envsPath));
        else
          angular['projects'][_options.project]['architect']['build'].configurations[_options.config]['fileReplacements'] = [fileReplace(envsPath)];

      } else {

        angular['projects'][_options.project]['architect']['build'].configurations[_options.config] = {
          fileReplacements: [fileReplace(envsPath)]
        }

      }
      tree.overwrite('angular.json', JSON.stringify(angular, null, '\t'));
    }


    let sourceText = tree.read(envsPath + '/environment.ts')!.toString('utf-8');
    let sourceFile = ts.createSourceFile(envsPath + '/environment.ts', sourceText, ts.ScriptTarget.Latest, true);
    let nodes: ts.Node[] = getSourceNodes(sourceFile);

    const baseEnvironmentVars = getDefaultEnvironmentCode(nodes);
    _context.logger.info('Original environment \n' + baseEnvironmentVars.getText());


    // _context.addTask(new NodePackageInstallTask);
    let _sourceName = normalize(__dirname + '/template/base.ts');
    let _targetName = normalize(__dirname + `/template/environment.${_options.config}.ts`);
    fs.renameSync(_sourceName, _targetName);

    const source: Source = url("./template");
    const transformedSource: Source = apply(source,
      [
        template({
          ..._options,
          environmentFilesMerger: () => baseEnvironmentVars.getText()
        }),
        move(normalize(envsPath))
      ]);
    let _R = mergeWith(transformedSource)(tree, _context);

    fs.renameSync(_targetName, _sourceName);
    return _R
  };
}
