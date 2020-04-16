import { OnPremOptions } from "./schema";
import { SchematicContext } from "@angular-devkit/schematics";

const fs = require('fs');
const path = require('path');


export class EnvProcessor {
  private baseJson: any = {};
  private baseFilePath = path.join(__dirname, './');
  private options: OnPremOptions;
  private context: SchematicContext;

  constructor(options: OnPremOptions, context: SchematicContext) {
    this.options = options;
    this.context = context;

  }

  lookForBaseJsonPathInNG(angularJson?: any): string {
    const configurations = Object.keys(angularJson.projects[this.options.project].architect.build.configurations);
    let envPath: string = '';
    configurations.some((configName) => {
      const config = angularJson.projects[this.options.project].architect.build.configurations[configName];

      if (config.hasOwnProperty('fileReplacements') && Array.isArray(config.fileReplacements)) {
        for (let i = 0; i < config.fileReplacements.length; i++) {
          const repls = config.fileReplacements[i].replace.split('/');
          if (repls.pop() === 'environment.ts') {
            envPath = repls.join('/');
            return true;
          }
        }
      }
    });

    return envPath;
  }

  loadBaseJson() {
    if (!this.options.hasOwnProperty('baseJson')) {
      let pathToFile = this.lookForBaseJsonPathInNG();
      this.baseFilePath = path.join(__dirname, pathToFile, 'base.environment.json');
    } else {
      this.baseFilePath = path.join(__dirname, this.options.path);
    }

    if (fs.existsSync(this.baseFilePath)) {
      let rawdata = fs.readFileSync(this.baseFilePath);
      this.baseJson = JSON.parse(rawdata);
    } else {
      this.context.logger.error(`Can't find the base json file. looking at => ${this.baseFilePath}`);
      process.exit(1);
    }
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



