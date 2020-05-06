import { OnPremOptions } from "./schema";
import { BUILDER_COMMAND, BUILDER_TARGET, DEFAULT_CONFIG_NAME } from "./constants";

const fs = require('fs');
const path = require('path');

export interface EnvPathResult {
  path?: string;
  error?: string;
}

export class EnvProcessor {
  private baseJson: any = {};
  private baseFilePath = path.join(__dirname, './');
  private options: OnPremOptions;


  constructor(options: OnPremOptions) {
    this.options = options;

  }

  private fileReplace(envPath: EnvPathResult) {
    return {
      replace: `${envPath.path}/environment.ts`,
      with: `${envPath.path}/environment.${this.options.config}.ts`,
    }
  };

  lookForBaseJsonPathInNG(angularJson?: any): EnvPathResult {
    const configurations = angularJson.projects[this.options.project].architect.build.configurations;
    const configNames: string[] = Object.keys(configurations);

    let envPath: EnvPathResult = {error: 'Not able to locate path of your environment.ts file. use --path'};

    configNames.forEach((configName: string) => {
      let config = configurations[configName];

      if (config.hasOwnProperty('fileReplacements') && Array.isArray(config.fileReplacements)) {

        for (let i = 0; i < config.fileReplacements.length; i++) {
          const repls = config.fileReplacements[i].replace.split('/');
          if (repls.pop() === 'environment.ts') {
            envPath.path = repls.join('/');
            envPath.error = undefined;
            return true;
          }

        }
      }
    });

    return envPath;
  }

  addFileReplacement(angular: any, envsPath: EnvPathResult) {
    const configName = this.options.config || DEFAULT_CONFIG_NAME;

    BUILDER_TARGET.options.environmentFile = `${envsPath.path}/environment.${this.options.config}.ts`;
    angular['projects'][this.options.project]['architect'][BUILDER_COMMAND] = BUILDER_TARGET;

    if (angular['projects'][this.options.project]['architect']['build'].configurations.hasOwnProperty(configName)) {
      if (angular['projects'][this.options.project]['architect']['build'].configurations[configName].hasOwnProperty('fileReplacements'))
        angular['projects'][this.options.project]['architect']['build'].configurations[configName]['fileReplacements'].push(this.fileReplace(envsPath));
      else
        angular['projects'][this.options.project]['architect']['build'].configurations[configName]['fileReplacements'] = [this.fileReplace(envsPath)];

    } else {

      angular['projects'][this.options.project]['architect']['build'].configurations[configName] = {
        fileReplacements: [this.fileReplace(envsPath)]
      }

    }
    return angular
  }

  mapEnvironmentVars() {
    const vars = Object.keys(process.env);
    vars.forEach((e) => {
      if (this.baseJson.hasOwnProperty(e)) {
        this.baseJson[e] = process.env[e];
      }
    });
  }

  updateJson() {
    fs.writeFileSync(this.baseFilePath, JSON.stringify(this.baseJson, null, 4), 'utf8');
  }

}



