import { OnPremOptions } from "./schema";
import { BUILDER_COMMAND, BUILDER_TARGET, DEFAULT_CONFIG_NAME } from "./constants";

const fs = require("fs");
const path = require("path");


export class EnvProcessor {
  private baseJson: any = {};
  private baseFilePath = path.join(__dirname, "./");
  private options: OnPremOptions;


  constructor(options: OnPremOptions){
    this.options = options;
  }

  private fileReplace(path: string){
    return {
      "replace": `${ path }/environment.ts`,
      "with": `${ path }/environment.${ this.options.config }.ts`,
    }
  };

  lookForBaseJsonPathInNG(angularJson?: any): string{
    const configurations = Object.keys(angularJson.projects[this.options.project].architect.build.configurations);

    let envPath: string = "";
    configurations.some((configName) => {
      const config = angularJson.projects[this.options.project].architect.build.configurations[configName];
      if (config.hasOwnProperty("fileReplacements") && Array.isArray(config.fileReplacements)) {
        for (const element of config.fileReplacements) {
          const repls = element.replace.split("/");
          if (repls.pop() === "environment.ts") {
            envPath = repls.join("/");
            return true;
          }
        }
      }
    });

    return envPath;
  }

  addFileReplacement(angular: any, envsPath: string){
    const configName = this.options.config || DEFAULT_CONFIG_NAME;

    BUILDER_TARGET.options.environmentFile = `${ envsPath }/environment.${ this.options.config }.ts`;
    angular["projects"][this.options.project]["architect"][BUILDER_COMMAND] = BUILDER_TARGET;

    if (angular["projects"][this.options.project]["architect"]["build"].configurations.hasOwnProperty(configName)) {
      if (angular["projects"][this.options.project]["architect"]["build"].configurations[configName].hasOwnProperty("fileReplacements"))
        angular["projects"][this.options.project]["architect"]["build"].configurations[configName]["fileReplacements"].push(this.fileReplace(envsPath));
      else
        angular["projects"][this.options.project]["architect"]["build"].configurations[configName]["fileReplacements"] = [ this.fileReplace(envsPath) ];

    } else {

      angular["projects"][this.options.project]["architect"]["build"].configurations[configName] = {
        fileReplacements: [ this.fileReplace(envsPath) ]
      }

    }
    return angular
  }

  mapEnvironmentVars(){
    const vars = Object.keys(process.env);
    vars.forEach((e) => {
      if (this.baseJson.hasOwnProperty(e)) {
        this.baseJson[e] = process.env[e];
      }
    });
  }

  updateJson(){
    console.log("this.baseJson", this.baseJson)
    fs.writeFileSync(this.baseFilePath, JSON.stringify(this.baseJson, null, 4), "utf8");
  }

}



