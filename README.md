[![ng-process-env CI Process](https://github.com/danduh/ng-process-env/actions/workflows/main.yml/badge.svg)](https://github.com/danduh/ng-process-env/actions/workflows/main.yml)

# Environment variables from process into Angular app

Angular already has its own environment system, which allows us to configure everything in
src/environments/environment.ts, and we can create as many environments as we need. The problem is, sometimes you want
to use the System Environment variables, for example, some configuration from the CI server or if the build process is
running an "on-premise" server; in this case, the Angular environment system will not help.

**ng-process-env** will help you to retrieve values from System Environment variables (`process.env[]`) and update
relevant `environment.ts` file.

### Installing

Just add it into your app.

```bash
npm i ng-process-env
```

Run

```bash
ng g ng-process-env:process-env
```

> For monorepo managed by NRWL, use `nx` command instead of `ng`

You will be prompted to insert relevant project name.

```bash
? Project name to update angular.json config. 
(you can skip and do it later using schematics or manually) my-app
 Project my-app will be updated
    Env File will be created at apps/my-app/src/environments
```

```bash
? You can set name for config to be updated or added as a new one, 'onprem' - default 
```

Define configuration name. It will create:

- `environment.<myconfig>.ts` file in your /environments folder.
- `<myconfig>` section in your angular.json or project.json for nrwl managed monorepo

_environment.<myconfig>.ts_

```typescript
export const environment = {
    production: false,
    baseUrl: 'http://localhost:4200',
    envVar: {
        /**
         * Add environment variables you want to retriev from process
         * PORT:4200,
         * VAR_NAME: defaultValue
         */
    }
};
```

_angular.json_ \ _project.json_

```json
{
  "targets": {
    "build": {
      ...
      "configurations": {
        "myconfig": {
          "fileReplacements": [
            {
              "replace": "apps/portfolio/src/environments/environment.ts",
              "with": "apps/portfolio/src/environments/environment.myconfig.ts"
            }
          ]
        }
      }
    }
  }
}
```

Update `myconfig` section according to your needs

## Collect Vars

Open a created file `environment.<myconfig>.ts`

Update `envVar` section with variables you want to be retrieved from `process.env`.

- **Important**: set default values.

```typescript
export const environment = {
    production: false,
    baseUrl: 'http://localhost:4200',
    envVar: {
        myVarA: 3,
        myVarB: 'someValue'
    }
};
```

## _This part can be run during CI/CD process_

To update the created environment.<myconfig>.ts file with variables from `process.env`.

```bash
export myVarA=4
export myVarB=otherValue
ng run my-app:collect-vars
```

It will change file to:

```typescript
export const environment = {
    production: false,
    baseUrl: "http://localhost:4200",
    envVar: {
        myVarA: 4 as number,
        myVarB: "otherValue"
    }
};
```

After it, you can run a build command.
